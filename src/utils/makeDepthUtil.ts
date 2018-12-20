// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
import WebSocket from 'ws';
import Web3Wrapper from '../../../duo-contract-wrapper/src/Web3Wrapper';
import orderBookUtil from '../../../israfel-relayer/src/utils/orderBookUtil';
import Web3Util from '../../../israfel-relayer/src/utils/Web3Util';
import * as CST from '../common/constants';
import {
	IAcceptedPrice,
	IOption,
	IOrderBookSnapshot,
	IToken,
	IWsInfoResponse,
	IWsOrderBookResponse,
	IWsOrderBookUpdateResponse,
	IWsOrderHistoryRequest,
	IWsRequest,
	IWsResponse
} from '../common/types';
import { ContractUtil } from './contractUtil';
import { OrderMakerUtil } from './orderMakerUtil';
import util from './util';

class MakeDepthUtil {
	public ws: WebSocket | null = null;
	public reconnectionNumber: number = 0;
	public latestVersionNumber: number = 0;
	public orderBookSnapshot: IOrderBookSnapshot | null = null;
	public tokens: IToken[] = [];

	public pair: string = '';
	public web3Util: Web3Util | null = null;
	public web3Wrapper: Web3Wrapper | null = null;
	public contractUtil: ContractUtil | null = null;
	public orderMakerUtil: OrderMakerUtil | null = null;
	public contractAddress: string = '';
	public contractType: string = '';
	public contractTenor: string = '';
	public tokenIndex: number = 0;
	public lastAcceptedPrice: IAcceptedPrice | null = null;
	private orderBookSubscribed: boolean = false;
	public orderSubscribed: boolean = false;
	public isMakingOrder: boolean = false;

	public connectToRelayer(option: IOption) {
		this.ws = new WebSocket(`wss://relayer.${option.live ? 'live' : 'dev'}.israfel.info:8080`);
		this.ws.onopen = () => {
			console.log('reconnect');
			this.reconnectionNumber = 0;
		};
		this.ws.onmessage = (m: any) => this.handleMessage(m.data.toString());
		this.ws.onerror = () => this.reconnect(option);
		this.ws.onclose = () => this.reconnect(option);
		if (this.orderMakerUtil) this.orderMakerUtil.ws = this.ws;
	}

	public subscribeOrderBook(pair: string) {
		if (!this.ws) return;

		const msg: IWsRequest = {
			method: CST.WS_SUB,
			channel: CST.DB_ORDER_BOOKS,
			pair: pair
		};
		console.log(msg);
		this.ws.send(JSON.stringify(msg));
	}

	public subscribeOrders(pair: string, address: string) {
		if (!this.ws) return;

		const msg: IWsOrderHistoryRequest = {
			method: CST.WS_SUB,
			channel: CST.DB_ORDERS,
			pair: pair,
			account: address
		};
		this.ws.send(JSON.stringify(msg));
	}

	public async handleOrderBookResponse(orderBookResponse: IWsResponse) {
		if (orderBookResponse.status !== CST.WS_OK) util.logDebug('orderBook error');
		else if (orderBookResponse.method === CST.DB_SNAPSHOT)
			if (
				(orderBookResponse as IWsOrderBookResponse).orderBookSnapshot.version <
				this.latestVersionNumber
			) {
				this.subscribeOrderBook(
					(orderBookResponse as IWsOrderBookResponse).orderBookSnapshot.pair
				);
				this.latestVersionNumber = (orderBookResponse as IWsOrderBookResponse).orderBookSnapshot.version;
			} else {
				this.orderBookSnapshot = (orderBookResponse as IWsOrderBookResponse).orderBookSnapshot;
				if (!this.isMakingOrder) {
					this.isMakingOrder = true;
					await this.handleOrderBookUpdate();
				}
			}
		else {
			this.latestVersionNumber = (orderBookResponse as IWsOrderBookUpdateResponse)
				.orderBookUpdate
				? (orderBookResponse as IWsOrderBookUpdateResponse).orderBookUpdate.version
				: 0;

			const obUpdate = (orderBookResponse as IWsOrderBookUpdateResponse).orderBookUpdate;

			if (this.orderBookSnapshot) {
				orderBookUtil.updateOrderBookSnapshot(this.orderBookSnapshot, obUpdate);
				if (
					!this.isMakingOrder &&
					(!this.orderBookSnapshot.bids.length ||
						!this.orderBookSnapshot.asks.length ||
						this.orderBookSnapshot.asks
							.map(ask => ask.balance)
							.reduce((accumulator, currentValue) => accumulator + currentValue) <
							40 ||
						this.orderBookSnapshot.bids
							.map(bid => bid.balance)
							.reduce((accumulator, currentValue) => accumulator + currentValue) < 40)
				) {
					this.isMakingOrder = true;
					await this.handleOrderBookUpdate();
				}
			} else util.logDebug(`update comes before snapshot`);
		}
	}

	public handleOrdesResponse(ordersResponse: any) {
		console.log(ordersResponse.method);
	}

	private async handleOrderBookUpdate() {
		console.log(this.orderBookSnapshot);
		util.logInfo(`anlayzing new orderBookSnapshot`);
		if (!this.orderBookSnapshot || !this.orderMakerUtil || !this.lastAcceptedPrice) {
			util.logDebug(`no orderBookSnapshot or orderMakerUtil or lastAcceptedPrice, pls check`);
			return;
		}

		const expectedMidPrice = util.round(
			(this.tokenIndex === 0 ? this.lastAcceptedPrice.navA : this.lastAcceptedPrice.navB) /
				this.lastAcceptedPrice.price,
			'3'
		);

		util.logInfo(`expected midprice of pair ${this.pair} is ${expectedMidPrice}`);

		let createBidAmount = 0;
		let createAskAmount = 0;
		let numOfBidOrders = 0;
		let numOfAskOrders = 0;
		const existingBidPriceLevel = this.orderBookSnapshot.bids.map(bid => bid.price);
		const existingAskPriceLevel = this.orderBookSnapshot.asks.map(ask => ask.price);

		if (!this.orderBookSnapshot.bids.length && !this.orderBookSnapshot.asks.length) {
			util.logInfo(`no bids and asks, need to create brand new orderBook`);
			createAskAmount = 50;
			createBidAmount = 50;
			numOfBidOrders = 3;
			numOfAskOrders = 3;
		} else if (!this.orderBookSnapshot.bids.length && this.orderBookSnapshot.asks.length) {
			util.logInfo(`no bids ,have asks`);
			const bestAskPrice = this.orderBookSnapshot.asks[0].price;
			const totalLiquidity = this.orderBookSnapshot.asks
				.map(ask => ask.balance)
				.reduce((accumulator, currentValue) => accumulator + currentValue);
			util.logInfo(
				`best ask price is ${bestAskPrice} with totalLiquilidty ${totalLiquidity}`
			);
			if (bestAskPrice > expectedMidPrice) {
				createAskAmount = 50 - totalLiquidity;
				createBidAmount = 50;
				numOfBidOrders = 3;
				numOfAskOrders = 3 - this.orderBookSnapshot.asks.length;
			} else if (totalLiquidity <= 15 && bestAskPrice < expectedMidPrice) {
				util.logDebug(`ask side liquidity not enough, take all and recreate orderBook`);
				// take all
				await this.orderMakerUtil.takeOneSideOrders(
					this.pair,
					false,
					this.orderBookSnapshot.asks.filter(ask => ask.price <= expectedMidPrice)
				);
				createAskAmount = 50;
				createBidAmount = 50;
				numOfBidOrders = 3;
				numOfAskOrders = 3;
			}
		} else if (!this.orderBookSnapshot.asks.length && this.orderBookSnapshot.bids.length) {
			util.logInfo(`no asks, have bids`);
			const bestBidPrice = this.orderBookSnapshot.bids[0].price;
			const totalLiquidity = this.orderBookSnapshot.bids
				.map(bid => bid.balance)
				.reduce((accumulator, currentValue) => accumulator + currentValue);
			util.logInfo(
				`best bid price is ${bestBidPrice} with totalLiquilidty ${totalLiquidity}`
			);
			if (bestBidPrice < expectedMidPrice) {
				createBidAmount = 50 - totalLiquidity;
				createAskAmount = 50;
				numOfBidOrders = 1;
				// numOfBidOrders = 3 - this.orderBookSnapshot.bids.length;
				numOfAskOrders = 3;
			} else if (totalLiquidity <= 15 && bestBidPrice > expectedMidPrice) {
				util.logDebug(`bid side liquidity not enough, take all and recreate orderBook`);
				// take all
				await this.orderMakerUtil.takeOneSideOrders(
					this.pair,
					true,
					this.orderBookSnapshot.bids.filter(bid => bid.price >= expectedMidPrice)
				);
				createAskAmount = 50;
				createBidAmount = 50;
				numOfBidOrders = 3;
				numOfAskOrders = 3;
			}
		} else {
			const bestBidPrice = this.orderBookSnapshot.bids[0].price;
			const bestAskPrice = this.orderBookSnapshot.asks[0].price;

			const totalBidLiquidity = this.orderBookSnapshot.bids
				.map(bid => bid.balance)
				.reduce((accumulator, currentValue) => accumulator + currentValue);

			const totalAskLiquidity = this.orderBookSnapshot.asks
				.map(ask => ask.balance)
				.reduce((accumulator, currentValue) => accumulator + currentValue);

			if (expectedMidPrice <= bestAskPrice && expectedMidPrice >= bestBidPrice) {
				createAskAmount = 50 - totalAskLiquidity;
				createBidAmount = 50 - totalBidLiquidity;
				numOfBidOrders = 1;
				numOfAskOrders = 1;
			} else if (expectedMidPrice > bestAskPrice) {
				createBidAmount = 50 - totalBidLiquidity;
				// take ask
				await this.orderMakerUtil.takeOneSideOrders(
					this.pair,
					false,
					this.orderBookSnapshot.asks.filter(ask => ask.price <= expectedMidPrice)
				);
				const takedAskAmt = this.orderBookSnapshot.asks
					.filter(ask => ask.price <= expectedMidPrice)
					.map(ask => ask.balance)
					.reduce((accumulator, currentValue) => accumulator + currentValue);
				createAskAmount = 50 - takedAskAmt;
				numOfBidOrders = 1;
				numOfAskOrders = takedAskAmt < 50 ? 2 : 3;
			} else if (expectedMidPrice < bestBidPrice) {
				createAskAmount = 50 - totalAskLiquidity;
				// take bid
				await this.orderMakerUtil.takeOneSideOrders(
					this.pair,
					true,
					this.orderBookSnapshot.bids.filter(bid => bid.price >= expectedMidPrice)
				);
				const takedBidAmt = this.orderBookSnapshot.bids
					.filter(bid => bid.price <= expectedMidPrice)
					.map(bid => bid.balance)
					.reduce((accumulator, currentValue) => accumulator + currentValue);
				createBidAmount = 50 - takedBidAmt;
			}
		}

		util.logInfo(`createBidAmount: ${createBidAmount} numOfBidOrders: ${numOfBidOrders}
		createAskAmount: ${createAskAmount} numOfAskOrders: ${numOfAskOrders}`);

		if (createAskAmount > 0 && numOfAskOrders > 0)
			await this.orderMakerUtil.createOrderBookSide(
				this.pair,
				false,
				this.contractType,
				this.contractTenor,
				expectedMidPrice,
				createAskAmount,
				numOfAskOrders,
				existingAskPriceLevel
			);
		if (createBidAmount > 0 && numOfBidOrders)
			await this.orderMakerUtil.createOrderBookSide(
				this.pair,
				true,
				this.contractType,
				this.contractTenor,
				expectedMidPrice,
				createBidAmount,
				numOfBidOrders,
				existingBidPriceLevel
			);
		this.isMakingOrder = false;
	}

	public handleInfoResonsde(info: IWsInfoResponse) {
		const { tokens, acceptedPrices } = info;
		if (!this.web3Util || !this.orderMakerUtil) {
			util.logDebug(`no web3Util initiated`);
			return;
		}
		this.web3Util.setTokens(tokens);
		const token = tokens.find(t => t.code === this.pair.split('|')[0]);
		if (token) this.contractAddress = token.custodian;
		const newAcceptedPrice =
			acceptedPrices[this.contractAddress][acceptedPrices[this.contractAddress].length - 1];
		if (!this.lastAcceptedPrice) this.lastAcceptedPrice = newAcceptedPrice;
		else if (this.lastAcceptedPrice && newAcceptedPrice.price !== this.lastAcceptedPrice.price)
			this.lastAcceptedPrice = acceptedPrices[this.contractAddress].length
				? newAcceptedPrice
				: null;
		// TODO handle nav change

		if (!this.orderBookSubscribed) {
			this.subscribeOrderBook(this.pair);
			this.orderBookSubscribed = true;
		}
		if (!this.orderSubscribed) {
			for (const address of this.orderMakerUtil.availableAddrs)
				this.subscribeOrders(this.pair, address);

			this.orderSubscribed = true;
		}
	}

	public handleMessage(message: string) {
		const res: IWsResponse = JSON.parse(message);
		if (res.method !== CST.WS_UNSUB)
			switch (res.channel) {
				case CST.DB_ORDER_BOOKS:
					this.handleOrderBookResponse(res);
					break;
				case CST.DB_ORDERS:
					this.handleOrdesResponse(res);
					break;
				case CST.WS_INFO:
					this.handleInfoResonsde(res as IWsInfoResponse);
					break;
				default:
					util.logDebug(`received msg from non intended channel`);
					break;
			}
	}

	private reconnect(option: IOption) {
		this.ws = null;
		if (this.reconnectionNumber < 6)
			setTimeout(() => {
				this.connectToRelayer(option);
				this.reconnectionNumber++;
			}, 5000);
		else util.logDebug('We have tried 6 times. Please try again later');
	}

	public getTokenIndex(option: IOption) {
		if (option.token.toLowerCase().includes('b') || option.token.toLowerCase().includes('l'))
			this.tokenIndex = 1;
	}

	public async startMake(
		contractUtil: ContractUtil,
		web3Wrapper: Web3Wrapper,
		web3Util: Web3Util,
		option: IOption
	) {
		util.logInfo(`makeDepth for ${option.token}`);

		this.web3Util = web3Util;
		this.web3Wrapper = web3Wrapper;
		this.contractUtil = contractUtil;
		const orderMakerUtil: OrderMakerUtil = new OrderMakerUtil(
			web3Util,
			this.ws as WebSocket,
			contractUtil
		);
		this.orderMakerUtil = orderMakerUtil;
		this.orderMakerUtil.availableAddrs = await web3Util.getAvailableAddresses();
		util.logInfo(`avaialbel address are ${JSON.stringify(this.orderMakerUtil.availableAddrs)}`);

		this.getTokenIndex(option);

		this.pair = option.token + '|' + CST.TOKEN_WETH;
		this.contractType = option.type;
		this.contractTenor = option.tenor;

		this.orderMakerUtil.availableAddrs = await contractUtil.checkBalance(
			this.pair,
			this.tokenIndex,
			this.orderMakerUtil.availableAddrs
		);
		await this.connectToRelayer(option);
		setInterval(
			() =>
				contractUtil.checkBalance(
					this.pair,
					this.tokenIndex,
					orderMakerUtil.availableAddrs
				),
			CST.ONE_MINUTE_MS * 30
		);
	}
}

const makeDepthUtil = new MakeDepthUtil();
export default makeDepthUtil;
