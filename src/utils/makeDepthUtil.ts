// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
// import moment from 'moment';
import WebSocket from 'ws';
// import DualClassWrapper from '../../../duo-contract-wrapper/src/DualClassWrapper';
// import Web3Wrapper from '../../../duo-contract-wrapper/src/Web3Wrapper';
import israfelDynamoUtil from '../../../israfel-relayer/src/utils/dynamoUtil';
import orderUtil from '../../../israfel-relayer/src/utils/orderUtil';
import Web3Util from '../../../israfel-relayer/src/utils/Web3Util';
import * as CST from '../common/constants';
import {
	// IAccounts,
	// IDualClassStates,
	IOption,
	IOrderBookSnapshot,
	IToken,
	IWsAddOrderRequest,
	// IWsInfoResponse,
	IWsOrderBookResponse,
	IWsRequest,
	IWsResponse
} from '../common/types';
import { ContractUtil } from './contractUtil';
import util from './util';

class MakeDepthUtil {
	public ws: WebSocket | null = null;
	public reconnectionNumber: number = 0;
	public latestVersionNumber: number = 0;
	public orderBookSnapshot: IOrderBookSnapshot | null = null;
	public tokens: IToken[] = [];
	public availableAddrs: string[] = [];
	public currentAddrIdx: number = 0;
	public pair: string = '';
	public web3Util: Web3Util | null = null;
	public contractUtil: ContractUtil | null = null;
	public tokenIndex: number = 0;

	public getCurrentAddress() {
		const currentAddr = this.availableAddrs[this.currentAddrIdx];
		this.currentAddrIdx = (this.currentAddrIdx + 1) % this.availableAddrs.length;
		return currentAddr;
	}

	public connectToRelayer(option: IOption) {
		this.ws = new WebSocket(`wss://relayer.${option.live ? 'live' : 'dev'}.israfel.info:8080`);
		this.ws.onopen = () => {
			console.log('reconnect');
			this.reconnectionNumber = 0;
		};
		this.ws.onmessage = (m: any) => this.handleMessage(m.data.toString());
		this.ws.onerror = () => this.reconnect(option);
		this.ws.onclose = () => this.reconnect(option);
	}

	public subscribeOrderBook(pair: string) {
		if (!this.ws) return;

		const msg: IWsRequest = {
			method: CST.WS_SUB,
			channel: CST.DB_ORDER_BOOKS,
			pair: pair
		};
		this.ws.send(JSON.stringify(msg));
	}

	public subscribeOrders(pair: string) {
		if (!this.ws) return;

		const msg: IWsRequest = {
			method: CST.WS_SUB,
			channel: CST.DB_ORDERS,
			pair: pair
		};
		this.ws.send(JSON.stringify(msg));
	}

	public handleOrderBookResponse(orderBookResponse: IWsResponse) {
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
			} else
				this.orderBookSnapshot = (orderBookResponse as IWsOrderBookResponse).orderBookSnapshot;
	}

	public handleOrdesResponse(ordersResponse: any) {
		console.log(ordersResponse);
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
					console.log('received info');
					// const {
					// 	tokens,
					// 	processStatus,
					// 	acceptedPrices,
					// 	exchangePrices
					// } = res as IWsInfoResponse;
					// console.log(tokens, processStatus, acceptedPrices, exchangePrices);
					break;
				default:
					break;
			}
	}

	private reconnect(option: IOption) {
		this.ws = null;
		if (this.reconnectionNumber < 6)
			// this.handleReconnect();
			setTimeout(() => {
				this.connectToRelayer(option);
				this.reconnectionNumber++;
			}, 5000);
		else util.logDebug('We have tried 6 times. Please try again later');
	}

	public async placeOrder(isBid: boolean, price: number, amount: number, pair: string) {
		if (!this.web3Util) throw new Error('no web3Util initiated');
		if (!this.web3Util.isValidPair(pair)) throw new Error('invalid pair');
		const [code1, code2] = pair.split('|');
		const token1 = this.web3Util.getTokenByCode(code1);
		if (!token1) throw new Error('invalid pair');
		const address1 = token1.address;
		const address2 = this.web3Util.getTokenAddressFromCode(code2);

		const amountAfterFee = orderUtil.getAmountAfterFee(
			amount,
			price,
			token1.feeSchedules[code2],
			isBid
		);

		const expiry = Math.floor(util.getExpiryTimestamp(false) / 1000);

		if (!amountAfterFee.makerAssetAmount || !amountAfterFee.takerAssetAmount)
			throw new Error('invalid amount');

		const rawAskOrder = await this.web3Util.createRawOrder(
			pair,
			this.getCurrentAddress(),
			isBid ? address2 : address1,
			isBid ? address1 : address2,
			amountAfterFee.makerAssetAmount,
			amountAfterFee.takerAssetAmount,
			expiry
		);

		const msgAsk: IWsAddOrderRequest = {
			method: CST.DB_ADD,
			channel: CST.DB_ORDERS,
			pair: pair,
			orderHash: rawAskOrder.orderHash,
			order: rawAskOrder.signedOrder
		};
		if (!this.ws) {
			console.log('no client initiated');
			return;
		}

		util.logInfo('send add order request' + JSON.stringify({
			price: price,
			amount: amount,
			isBid: isBid
		}));
		this.ws.send(JSON.stringify(msgAsk));
	}

	private async makeBeethoven(option: IOption) {
		if (!this.contractUtil) {
			util.logDebug(`no contractUtil initiated`);
			return;
		}
		util.logInfo(`make depth for ${option.type} contract`);
		if (![CST.TENOR_PPT, CST.TENOR_M19].includes(option.tenor)) {
			util.logDebug('wrong contract tenor');
			return;
		}
		util.logInfo(`make depth for ${option.tenor} contract`);
		const prices: number[] = await this.contractUtil.estimateBeethovenPrice(option);
		if (!prices.length) {
			util.logDebug('no nav calculated');
			return;
		}

		if (prices) {
			const midPrice = prices[this.tokenIndex];

			for (let i = 0; i < 10; i++) {
				const bidPrice = util.round(midPrice - (i + 1) * 0.0005, '3');
				const askPrice = util.round(midPrice + (i + 1) * 0.0005, '3');
				const bidAmt = util.round(Math.random() * 10, '1');
				const askAmt = util.round(Math.random() * 10, '1');
				await this.placeOrder(true, bidPrice, bidAmt, this.pair);
				util.sleep(1000);
				await this.placeOrder(false, askPrice, askAmt, this.pair);
				util.sleep(1000);
				break;
			}
		}
	}

	public async batchRenderingOB(option: IOption) {
		if (!this.contractUtil) {
			util.logDebug(`no contractUtil initiated`);
			return;
		}
		util.logInfo(`start checking bot addrs balancing`);
		this.availableAddrs = await this.contractUtil.checkBalance(
			this.pair,
			this.tokenIndex,
			this.availableAddrs
		);

		switch (option.type) {
			case CST.BEETHOVEN:
				this.makeBeethoven(option);
				break;
			default:
				util.logDebug(`incorrect contract type specified`);
				return;
		}
	}

	public getTokenIndex(option: IOption) {
		if (option.token.toLowerCase().includes('b') || option.token.toLowerCase().includes('l'))
			this.tokenIndex = 1;
	}

	public async startMake(contractUtil: ContractUtil, web3Util: Web3Util, option: IOption) {
		util.logInfo(`makeDepth for ${option.token}`);
		this.availableAddrs = await web3Util.getAvailableAddresses();
		util.logInfo(`avaialbel address are ${JSON.stringify(this.availableAddrs)}`);
		this.web3Util = web3Util;
		this.contractUtil = contractUtil;
		this.getTokenIndex(option);

		await this.connectToRelayer(option);
		this.tokens = JSON.parse(JSON.stringify(await israfelDynamoUtil.scanTokens()));
		web3Util.setTokens(this.tokens);

		this.pair = option.token + '|' + CST.TOKEN_WETH;
		await this.batchRenderingOB(option);
		setInterval(() => this.batchRenderingOB(option), CST.ONE_MINUTE_MS * 15);
	}
}

const makeDepthUtil = new MakeDepthUtil();
export default makeDepthUtil;
