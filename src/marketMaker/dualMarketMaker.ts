import {
	// Constants as WrapperConstants,
	DualClassWrapper,
	IDualClassStates
	// Web3Wrapper
} from '@finbook/duo-contract-wrapper';
import { IPrice } from '@finbook/duo-market-data';
import {
	Constants,
	IAccount,
	IOrderBookSnapshot,
	IOrderBookSnapshotLevel,
	IToken,
	IUserOrder,
	OrderBookUtil,
	RelayerClient,
	Util,
	Web3Util
} from '@finbook/israfel-common';
import * as CST from '../common/constants';
import { IOption } from '../common/types';
import BaseMarketMaker from './BaseMarketMaker';

class DualMarketMaker extends BaseMarketMaker {
	public tokens: IToken[] = [];
	public liveBidOrders: IUserOrder[][] = [[], []];
	public liveAskOrders: IUserOrder[][] = [[], []];
	public makerAccount: IAccount = { address: '0x0', privateKey: '' };
	public custodianStates: IDualClassStates | null = null;
	public priceStep: number = 0.0001;
	public tokenBalances: number[] = [0, 0, 0];
	public pendingOrders: { [orderHash: string]: boolean } = {};
	public exchangePrices: { [source: string]: IPrice[] } = {};
	public isBeethoven = true;
	public isInitialized = false;
	public isSendingOrder = false;
	public isMaintainingBalance = false;
	public isMakingOrders = false;
	public lastMid: number[] = [0, 0];

	public async makeOrders(
		relayerClient: RelayerClient,
		dualClassWrapper: DualClassWrapper,
		pair: string
	) {
		if (!this.canMakeOrder(relayerClient, pair) || this.isMakingOrders) return;

		this.isMakingOrders = true;
		const isA = this.isA(pair);
		const pariIndex = isA ? 0 : 1;
		const otherPairIndex = 1 - pariIndex;
		const otherPair = this.getOtherPair(pair);

		Util.logDebug(`[${pair}] start making orders`);
		this.custodianStates = await dualClassWrapper.getStates();
		const alpha = this.custodianStates.alpha;
		const ethPrice = this.getEthPrice();
		const ethNavInEth = 1 / this.custodianStates.resetPrice;
		const navPrices = DualClassWrapper.calculateNav(
			this.custodianStates,
			this.isBeethoven,
			ethPrice,
			Util.getUTCNowTimestamp()
		);
		const tokenNavInEth = navPrices[pariIndex] / ethPrice;
		Util.logDebug(`[${pair}] ethPrice ${ethPrice} token nav ${navPrices[0]} ${navPrices[1]}`);
		Util.logDebug(`[${pair}] eth nav in eth ${ethNavInEth} token nav in eth ${tokenNavInEth}`);
		const orderBookSnapshot = relayerClient.orderBookSnapshots[pair];
		const newMid = OrderBookUtil.getOrderBookSnapshotMid(orderBookSnapshot);
		const newSpread = OrderBookUtil.getOrderBookSnapshotSpread(orderBookSnapshot);
		const newBids = orderBookSnapshot.bids;

		const newAsks = orderBookSnapshot.asks;

		let bestBidPrice = newBids.length
			? newBids[0].price
			: newAsks.length
			? newAsks[0].price - this.priceStep
			: tokenNavInEth - this.priceStep;
		let bestAskPrice = newAsks.length
			? newAsks[0].price
			: newBids.length
			? newBids[0].price + this.priceStep
			: tokenNavInEth + this.priceStep;
		Util.logDebug(`[${pair}] best bid ${bestBidPrice}, best ask ${bestAskPrice}`);

		if (this.lastMid[pariIndex] === 0 || newSpread <= 3 * this.priceStep) {
			if (newAsks.length < CST.MIN_ORDER_BOOK_LEVELS)
				await this.createOrderBookSide(
					relayerClient,
					pair,
					bestAskPrice,
					false,
					CST.MIN_ORDER_BOOK_LEVELS - newAsks.length
				);
			if (newBids.length < CST.MIN_ORDER_BOOK_LEVELS) {
				Util.logDebug(JSON.stringify(newBids));
				Util.logDebug(`[${pair}] bid for ${pair} has insufficient liquidity, make orders`);
				await this.createOrderBookSide(
					relayerClient,
					pair,
					bestBidPrice,
					true,
					CST.MIN_ORDER_BOOK_LEVELS - newBids.length
				);
			}
		} else if (newMid > this.lastMid[pariIndex]) {
			if (newAsks.length < CST.MIN_ORDER_BOOK_LEVELS)
				await this.createOrderBookSide(
					relayerClient,
					pair,
					bestAskPrice,
					false,
					CST.MIN_ORDER_BOOK_LEVELS - newAsks.length
				);

			bestBidPrice = bestAskPrice - this.priceStep * 3;
			await this.createOrderBookSide(relayerClient, pair, bestBidPrice, true, 1, false);
		} else if (newMid < this.lastMid[pariIndex]) {
			if (newBids.length < CST.MIN_ORDER_BOOK_LEVELS) {
				Util.logDebug(JSON.stringify(newBids));
				Util.logDebug(`[${pair}] bid for ${pair} has insufficient liquidity, make orders`);
				await this.createOrderBookSide(
					relayerClient,
					pair,
					bestBidPrice,
					true,
					CST.MIN_ORDER_BOOK_LEVELS - newBids.length
				);
			}

			bestAskPrice = this.priceStep * 3 + bestBidPrice;
			await this.createOrderBookSide(relayerClient, pair, bestAskPrice, false, 1, false);
		}

		const otherTokenNoArbBidPrice =
			(ethNavInEth * (1 + alpha) - (isA ? alpha : 1) * bestAskPrice) / (isA ? 1 : alpha);

		const otherTokenNoArbAskPrice =
			(ethNavInEth * (1 + alpha) - (isA ? alpha : 1) * bestBidPrice) / (isA ? 1 : alpha);
		const otherTokenOrderBook = relayerClient.orderBookSnapshots[otherPair];
		const otherTokenBestBid = otherTokenOrderBook.bids.length
			? otherTokenOrderBook.bids[0].price
			: 0;
		const otherTokenBestAsk = otherTokenOrderBook.asks.length
			? otherTokenOrderBook.asks[0].price
			: Number.MAX_VALUE;

		Util.logDebug(
			`[${otherPair}] no arb bid ${otherTokenNoArbBidPrice} vs best bid ${otherTokenBestBid}`
		);
		Util.logDebug(
			`[${otherPair}] no arb ask ${otherTokenNoArbAskPrice} vs best ask ${otherTokenBestAsk}`
		);
		const orderHashesToCancel: string[] = [];
		let bidsToTake: IOrderBookSnapshotLevel[] = [];
		let asksToTake: IOrderBookSnapshotLevel[] = [];
		if (otherTokenBestBid >= otherTokenNoArbAskPrice) {
			for (const liveOrder of this.liveBidOrders[otherPairIndex])
				if (liveOrder.price >= otherTokenNoArbAskPrice)
					orderHashesToCancel.push(liveOrder.orderHash);
			bidsToTake = otherTokenOrderBook.bids.filter(
				bid => bid.price >= otherTokenNoArbAskPrice
			);
		}

		if (otherTokenBestAsk <= otherTokenNoArbBidPrice) {
			for (const liveOrder of this.liveAskOrders[otherPairIndex])
				if (liveOrder.price <= otherTokenNoArbBidPrice)
					orderHashesToCancel.push(liveOrder.orderHash);
			asksToTake = otherTokenOrderBook.asks.filter(
				ask => ask.price <= otherTokenNoArbBidPrice
			);
		}

		if (orderHashesToCancel.length) {
			Util.logDebug(`[${otherPair}] cancel arbitrage orders`);
			await this.cancelOrders(relayerClient, otherPair, orderHashesToCancel);
		}

		if (bidsToTake.length) {
			Util.logDebug(`[${otherPair}] take arbitrage bids`);
			await this.takeOneSideOrders(relayerClient, otherPair, true, bidsToTake);
		}
		if (asksToTake.length) {
			Util.logDebug(`[${otherPair}] take arbitrage asks`);
			await this.takeOneSideOrders(relayerClient, otherPair, false, asksToTake);
		}

		this.lastMid[pariIndex] = newMid;
		this.isMakingOrders = false;
	}

	public async createOrderBookFromNav(
		dualClassWrapper: DualClassWrapper,
		relayerClient: RelayerClient
	) {
		this.custodianStates = await dualClassWrapper.getStates();
		const ethPrice = this.getEthPrice();
		Util.logDebug(`eth price ${ethPrice}`);
		const navPrices = DualClassWrapper.calculateNav(
			this.custodianStates,
			this.isBeethoven,
			ethPrice,
			Util.getUTCNowTimestamp()
		);
		for (const index of [0, 1])
			for (const isBid of [true, false]) {
				console.log(this.tokens);

				await this.createOrderBookSide(
					relayerClient,
					this.tokens[index].code + '|' + Constants.TOKEN_WETH,
					navPrices[index] / ethPrice + (isBid ? -1 : 1) * this.priceStep,
					isBid,
					CST.MIN_ORDER_BOOK_LEVELS
				);
			}
	}

	public async handleOrderBookUpdate(
		dualClassWrapper: DualClassWrapper,
		relayerClient: RelayerClient,
		orderBookSnapshot: IOrderBookSnapshot
	) {
		const pair = orderBookSnapshot.pair;
		Util.logDebug(`received orderBookUpdate ${pair} ${orderBookSnapshot.version}`);
		await this.makeOrders(relayerClient, dualClassWrapper, pair);
	}

	public async handleOrderHistory(
		relayerClient: RelayerClient,
		dualClassWrapper: DualClassWrapper,
		userOrders: IUserOrder[]
	) {
		Util.logDebug('received order history');
		if (!this.isInitialized) {
			Util.logDebug(`dualClassWrapper not initialized, stop handleOrderHistory`);
			return;
		}
		const processed: { [orderHash: string]: boolean } = {};
		userOrders.sort(
			(a, b) => a.pair.localeCompare(b.pair) || -a.currentSequence + b.currentSequence
		);
		const codes = this.tokens.map(token => token.code);
		userOrders.forEach(uo => {
			const { type, pair, side, orderHash, balance, price } = uo;
			if (processed[orderHash]) return;
			processed[orderHash] = true;
			if (type === Constants.DB_TERMINATE) return;
			const index = this.isA(pair) ? 0 : 1;
			if (side === Constants.DB_BID) this.liveBidOrders[index].push(uo);
			else this.liveAskOrders[index].push(uo);

			const code = pair.split('|')[0];
			if (codes.includes(code))
				if (side === Constants.DB_BID) this.tokenBalances[0] -= balance * price;
				else this.tokenBalances[index + 1] -= balance;
		});

		Util.logDebug('adjust available balance');
		for (const index of [0, 1]) {
			this.liveBidOrders[index].sort((a, b) => -a.price + b.price);
			this.liveAskOrders[index].sort((a, b) => a.price - b.price);
			const orderHashes = [
				...this.liveBidOrders[index].map(uo => uo.orderHash),
				...this.liveAskOrders[index].map(uo => uo.orderHash)
			];
			if (orderHashes.length) {
				Util.logDebug('cancel existing orders');
				await this.cancelOrders(
					relayerClient,
					this.tokens[index].code + '|' + Constants.TOKEN_WETH,
					orderHashes
				);
			}
		}

		Util.logDebug('create order book from nav');
		await this.createOrderBookFromNav(dualClassWrapper, relayerClient);
		relayerClient.subscribeOrderBook(this.tokens[0].code + '|' + Constants.TOKEN_WETH);
		relayerClient.subscribeOrderBook(this.tokens[1].code + '|' + Constants.TOKEN_WETH);
	}

	public async handleUserOrder(
		userOrder: IUserOrder,
		relayerClient: RelayerClient,
		dualClassWrapper: DualClassWrapper
	) {
		const isBid = userOrder.side === Constants.DB_BID;
		const { type, status, pair, orderHash, balance, price } = userOrder;
		Util.logDebug(`received order update for ${pair} ${orderHash} ${type} ${status}`);
		if (this.pendingOrders[orderHash]) delete this.pendingOrders[orderHash];
		const index = this.isA(pair) ? 0 : 1;
		const orderCache = isBid ? this.liveBidOrders : this.liveAskOrders;
		const prevVersion = orderCache[index].find(uo => uo.orderHash === orderHash);
		if (type === Constants.DB_TERMINATE && prevVersion) {
			// remove prev version;
			orderCache[index] = orderCache[index].filter(uo => uo.orderHash !== orderHash);
			if (isBid) this.tokenBalances[0] += prevVersion.balance * prevVersion.price;
			else this.tokenBalances[index + 1] += prevVersion.balance;
		} else if (type === Constants.DB_ADD && !prevVersion) {
			orderCache[index].push(userOrder);
			orderCache[index].sort((a, b) => (isBid ? -a.price + b.price : a.price - b.price));
			if (isBid) this.tokenBalances[0] -= balance * price;
			else this.tokenBalances[index + 1] -= balance;
			// cancel far away orders
			if (orderCache[index].length > CST.MIN_ORDER_BOOK_LEVELS) {
				Util.logDebug(pair + ' cancel orders too far away');
				const ordersToCancel = orderCache[index]
					.slice(CST.MIN_ORDER_BOOK_LEVELS)
					.map(o => o.orderHash);
				await this.cancelOrders(relayerClient, pair, ordersToCancel);
			}
		} else if (
			type === Constants.DB_UPDATE &&
			status !== Constants.DB_MATCHING &&
			prevVersion
		) {
			if (isBid) this.tokenBalances[0] -= (balance - prevVersion.balance) * price;
			else this.tokenBalances[index + 1] -= balance - prevVersion.balance;
			// override previous version;
			Object.assign(prevVersion, userOrder);
		}

		await this.maintainBalance(relayerClient.web3Util, dualClassWrapper);
		return this.makeOrders(relayerClient, dualClassWrapper, pair);
	}

	public connectToRelayer(relayerClient: RelayerClient, option: IOption) {
		let dualClassWrapper: DualClassWrapper | null = null;

		relayerClient.onInfoUpdate(async (tokens, status, acceptedPrices, exchangePrices) => {
			if (tokens && status && acceptedPrices && exchangePrices)
				this.exchangePrices = exchangePrices;
			if (!this.isInitialized) {
				this.isInitialized = true;
				dualClassWrapper = await this.initialize(relayerClient, option);
			}
		});

		relayerClient.onOrder(
			userOrders =>
				this.handleOrderHistory(
					relayerClient,
					dualClassWrapper as DualClassWrapper,
					userOrders
				),
			userOrder =>
				this.handleUserOrder(
					userOrder,
					relayerClient,
					dualClassWrapper as DualClassWrapper
				),
			(method, orderHash, error) => this.handleOrderError(method, orderHash, error)
		);
		relayerClient.onOrderBook(
			orderBookSnapshot =>
				this.handleOrderBookUpdate(
					dualClassWrapper as DualClassWrapper,
					relayerClient,
					orderBookSnapshot
				),
			(method, pair, error) => Util.logError(method + ' ' + pair + ' ' + error)
		);

		relayerClient.onConnection(
			() => Util.logDebug('connected'),
			() => {
				Util.logDebug('reconnecting');
				dualClassWrapper = null;
				this.isInitialized = false;
			}
		);
		relayerClient.connectToRelayer();

		global.setInterval(() => {
			Util.logInfo('hourly reinitialize');
			dualClassWrapper = null;
			this.isInitialized = false;
		}, 900000);
	}

	public startProcessing(option: IOption) {
		Util.logInfo(`starting bot for token ${option.token}`);
		const mnemonic = require('../keys/mnemomicBot.json');
		const live = option.env === Constants.DB_LIVE;
		let infura = { token: '' };
		try {
			infura = require('../keys/infura.json');
		} catch (error) {
			Util.logError(error);
		}
		const web3Util = new Web3Util(
			null,
			(live ? Constants.PROVIDER_INFURA_MAIN : Constants.PROVIDER_INFURA_KOVAN) +
				'/' +
				infura.token,
			mnemonic[option.token],
			live
		);
		this.makerAccount = Web3Util.getAccountFromMnemonic(mnemonic[option.token], 0);
		this.isBeethoven = option.token.startsWith('a');
		this.connectToRelayer(new RelayerClient(web3Util, option.env), option);
	}
}

const dualMarketMaker = new DualMarketMaker();
export default dualMarketMaker;
