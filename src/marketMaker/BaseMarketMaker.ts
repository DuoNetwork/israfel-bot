import {
	Constants as WrapperConstants,
	DualClassWrapper,
	IDualClassStates,
	Web3Wrapper
} from '@finbook/duo-contract-wrapper';
import { Constants as DataConstants, IPrice } from '@finbook/duo-market-data';
import {
	Constants,
	IAccount,
	// IOrderBookSnapshot,
	IOrderBookSnapshotLevel,
	IToken,
	IUserOrder,
	// OrderBookUtil,
	RelayerClient,
	Util,
	Web3Util
} from '@finbook/israfel-common';
import * as CST from '../common/constants';
import { IOption } from '../common/types';

export default class BaseMarketMaker {
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

	public isA(pair: string) {
		return pair.startsWith(this.tokens[0].code);
	}

	public getOtherPair(pair: string) {
		const isA = this.isA(pair);
		return this.tokens[isA ? 1 : 0].code + '|' + pair.split('|')[1];
	}

	public getEthPrice() {
		return this.exchangePrices[DataConstants.API_KRAKEN] &&
			this.exchangePrices[DataConstants.API_KRAKEN].length
			? this.exchangePrices[DataConstants.API_KRAKEN][0].close
			: 0;
	}

	public async checkAllowance(web3Util: Web3Util, dualClassWrapper: DualClassWrapper) {
		Util.logDebug('start to check allowance');
		const address = this.makerAccount.address;
		for (const code of [Constants.TOKEN_WETH, this.tokens[0].code, this.tokens[1].code])
			if (!(await web3Util.getTokenAllowance(code, address))) {
				Util.logDebug(`${address} ${code} allowance is 0, approving`);
				const txHash = await web3Util.setUnlimitedTokenAllowance(code, address);
				await web3Util.awaitTransactionSuccessAsync(txHash);
			}

		const custodianAddress = dualClassWrapper.address;
		if (!(await web3Util.getTokenAllowance(Constants.TOKEN_WETH, address, custodianAddress))) {
			Util.logDebug(`${address} for custodian allowance is 0, approving`);
			const txHash = await web3Util.setUnlimitedTokenAllowance(
				Constants.TOKEN_WETH,
				address,
				custodianAddress
			);
			await web3Util.awaitTransactionSuccessAsync(txHash);
		}
		Util.logDebug('completed checking allowance');
	}

	public async maintainBalance(web3Util: Web3Util, dualClassWrapper: DualClassWrapper) {
		if (this.isMaintainingBalance) return;

		this.isMaintainingBalance = true;
		this.custodianStates = await dualClassWrapper.getStates();
		const { alpha, createCommRate, redeemCommRate } = this.custodianStates;
		let impliedWethBalance = this.tokenBalances[0];
		let wethShortfall = 0;
		let wethSurplus = 0;
		const tokensPerEth = DualClassWrapper.getTokensPerEth(this.custodianStates);
		let bTokenToCreate = 0;
		let bTokenToRedeem = 0;
		let ethAmountForCreation = 0;
		let ethAmountForRedemption = 0;
		if (
			this.tokenBalances[2] <= CST.MIN_TOKEN_BALANCE ||
			this.tokenBalances[1] <= CST.MIN_TOKEN_BALANCE * alpha
		) {
			const bTokenShortfall = Math.max(0, CST.TARGET_TOKEN_BALANCE - this.tokenBalances[2]);
			const aTokenShortfall = Math.max(
				0,
				CST.TARGET_TOKEN_BALANCE * alpha - this.tokenBalances[1]
			);
			bTokenToCreate = Math.max(aTokenShortfall / alpha, bTokenShortfall);
			ethAmountForCreation = bTokenToCreate / tokensPerEth[1] / (1 - createCommRate);
			impliedWethBalance -= ethAmountForCreation;
		}

		if (
			this.tokenBalances[2] >= CST.MAX_TOKEN_BALANCE &&
			this.tokenBalances[1] >= CST.MAX_TOKEN_BALANCE * alpha
		) {
			const bTokenSurplus = Math.max(0, this.tokenBalances[2] - CST.TARGET_TOKEN_BALANCE);
			const aTokenSurplus = Math.max(
				0,
				this.tokenBalances[1] - CST.TARGET_TOKEN_BALANCE * alpha
			);
			bTokenToRedeem = Math.min(aTokenSurplus / alpha, bTokenSurplus);
			ethAmountForRedemption = Util.round(
				(bTokenToRedeem / tokensPerEth[1]) * (1 - redeemCommRate)
			);
			impliedWethBalance += ethAmountForRedemption;
		}

		if (impliedWethBalance > CST.MAX_WETH_BALANCE)
			wethSurplus = impliedWethBalance - CST.TARGET_WETH_BALANCE;
		else if (impliedWethBalance < CST.MIN_WETH_BALANCE)
			wethShortfall = CST.TARGET_WETH_BALANCE - impliedWethBalance;

		const gasPrice = Math.max(
			await web3Util.getGasPrice(),
			WrapperConstants.DEFAULT_GAS_PRICE * Math.pow(10, 9)
		);

		if (wethShortfall) {
			Util.logDebug(`transfer WETH shortfall of ${wethShortfall} from faucet`);
			const tx = await web3Util.tokenTransfer(
				Constants.TOKEN_WETH,
				CST.FAUCET_ADDR,
				this.makerAccount.address,
				this.makerAccount.address,
				Util.round(wethShortfall)
			);
			Util.logDebug(`tx hash: ${tx}`);
			await web3Util.awaitTransactionSuccessAsync(tx);
			this.tokenBalances[0] += wethShortfall;
		}

		if (bTokenToCreate) {
			Util.logDebug(`create tokens from ${ethAmountForCreation} WETH`);
			const tx = await dualClassWrapper.create(
				this.makerAccount.address,
				Util.round(ethAmountForCreation),
				web3Util.contractAddresses.etherToken,
				{
					gasPrice: gasPrice,
					gasLimit: WrapperConstants.DUAL_CLASS_CREATE_GAS
				}
			);
			Util.logDebug(`tx hash: ${tx}`);
			await web3Util.awaitTransactionSuccessAsync(tx);
			this.tokenBalances[2] += bTokenToCreate;
			this.tokenBalances[1] += bTokenToCreate * alpha;
			this.tokenBalances[0] -= ethAmountForCreation;
		}

		if (bTokenToRedeem) {
			Util.logDebug(`redeem ${ethAmountForRedemption} WETH from tokens`);
			let tx = await dualClassWrapper.redeem(
				this.makerAccount.address,
				Util.round(bTokenToRedeem) * alpha,
				Util.round(bTokenToRedeem),
				{
					gasPrice: gasPrice,
					gasLimit: WrapperConstants.DUAL_CLASS_REDEEM_GAS
				}
			);
			Util.logDebug(`tx hash: ${tx}`);
			await web3Util.awaitTransactionSuccessAsync(tx);
			this.tokenBalances[2] -= bTokenToRedeem;
			this.tokenBalances[1] -= bTokenToRedeem * alpha;
			Util.logDebug(`wrapping ether with amt ${ethAmountForRedemption}`);
			tx = await web3Util.wrapEther(ethAmountForRedemption, this.makerAccount.address);
			Util.logDebug(`tx hash: ${tx}`);
			await web3Util.awaitTransactionSuccessAsync(tx);
			this.tokenBalances[0] += ethAmountForRedemption;
		}

		if (wethSurplus) {
			Util.logDebug(`transfer WETH surplus of ${wethSurplus} to faucet`);
			const tx = await web3Util.tokenTransfer(
				Constants.TOKEN_WETH,
				this.makerAccount.address,
				CST.FAUCET_ADDR,
				this.makerAccount.address,
				Util.round(wethSurplus)
			);
			Util.logDebug(`tx hash: ${tx}`);
			await web3Util.awaitTransactionSuccessAsync(tx);
			this.tokenBalances[0] -= wethSurplus;
		}
		this.isMaintainingBalance = false;
	}

	public canMakeOrder(relayerClient: RelayerClient, pair: string) {
		const otherPair = this.getOtherPair(pair);
		if (
			!relayerClient.orderBookSnapshots[pair] ||
			!relayerClient.orderBookSnapshots[otherPair]
		) {
			Util.logDebug('waiting for the other orderbook');
			return false;
		}

		if (this.isSendingOrder || !Util.isEmptyObject(this.pendingOrders)) {
			Util.logDebug(`non empty pending updates ${Object.keys(this.pendingOrders)}`);
			return false;
		}

		return true;
	}

	public async takeOneSideOrders(
		relayerClient: RelayerClient,
		pair: string,
		isBid: boolean,
		orderBookSide: IOrderBookSnapshotLevel[]
	) {
		this.isSendingOrder = true;
		for (const orderLevel of orderBookSide) {
			Util.logDebug(
				`${pair} taking an ${isBid ? 'bid' : 'ask'} order with price ${
					orderLevel.price
				} amount ${orderLevel.balance}`
			);
			if (!orderLevel.balance) continue;
			const orderHash = await relayerClient.addOrder(
				this.makerAccount.address,
				pair,
				orderLevel.price,
				orderLevel.balance,
				!isBid,
				Util.getExpiryTimestamp(true)
			);
			this.pendingOrders[orderHash] = true;
			await Util.sleep(1000);
		}
		this.isSendingOrder = false;
	}

	public async createOrderBookSide(
		relayerClient: RelayerClient,
		pair: string,
		bestPrice: number,
		isBid: boolean,
		level: number,
		adjustPrice: boolean = true
	) {
		const precision = this.tokens[0].precisions[Constants.TOKEN_WETH];
		this.isSendingOrder = true;
		for (let i = 0; i < level; i++) {
			const levelPrice = Number(
				Util.formatFixedNumber(
					bestPrice +
						(adjustPrice
							? (isBid ? -1 : 1) *
							(i + CST.MIN_ORDER_BOOK_LEVELS - level) *
							this.priceStep
							: 0),
					precision
				)
			);
			const orderHash = await relayerClient.addOrder(
				this.makerAccount.address,
				pair,
				levelPrice,
				20 + Number((Math.random() * 5).toFixed(1)),
				isBid,
				Util.getExpiryTimestamp(true)
			);
			this.pendingOrders[orderHash] = true;
			await Util.sleep(1000);
		}
		this.isSendingOrder = false;
	}

	public async cancelOrders(relayerClient: RelayerClient, pair: string, orderHashes: string[]) {
		this.isSendingOrder = true;
		orderHashes.forEach(o => (this.pendingOrders[o] = true));
		const signature = await relayerClient.web3Util.web3PersonalSign(
			this.makerAccount.address,
			Constants.TERMINATE_SIGN_MSG + orderHashes.join(',')
		);
		relayerClient.deleteOrder(pair, orderHashes, signature);
		this.isSendingOrder = false;
	}

	public handleOrderError(method: string, orderHash: string, error: string) {
		Util.logError(method + ' ' + orderHash + ' ' + error);
		if (this.pendingOrders[orderHash]) delete this.pendingOrders[orderHash];
		// TODO: handle add and terminate error
	}

	public getDualWrapper(infuraProvider: string, aToken: IToken, live: boolean) {
		const dualClassWrapper = new DualClassWrapper(
			new Web3Wrapper(null, infuraProvider, this.makerAccount.privateKey, live),
			aToken.custodian
		);
		return dualClassWrapper;
	}

	public async initialize(relayerClient: RelayerClient, option: IOption) {
		Util.logInfo('initializing dual class wrapper');
		this.isSendingOrder = false;
		this.isMaintainingBalance = false;
		this.isMakingOrders = false;
		const live = option.env === Constants.DB_LIVE;
		const aToken = relayerClient.web3Util.getTokenByCode(option.token);
		if (!aToken) throw new Error('no aToken');
		const bToken = relayerClient.web3Util.tokens.find(
			t => t.code !== aToken.code && t.custodian === aToken.custodian
		);
		if (!bToken) throw new Error('no bToken');
		this.tokens = [aToken, bToken];
		this.priceStep = aToken.precisions[Constants.TOKEN_WETH] * 20;
		let infura = {
			token: ''
		};
		try {
			infura = require('../keys/infura.json');
		} catch (error) {
			Util.logError(`error in loading infura token: ${JSON.stringify(error)}`);
		}
		const infuraProvider =
			(live ? Constants.PROVIDER_INFURA_MAIN : Constants.PROVIDER_INFURA_KOVAN) +
			'/' +
			infura.token;
		const dualClassWrapper = this.getDualWrapper(infuraProvider, aToken, live);
		const address = this.makerAccount.address;
		Util.logDebug(`updating balance for maker address ${address}`);
		this.tokenBalances = [
			await relayerClient.web3Util.getTokenBalance(Constants.TOKEN_WETH, address),
			await relayerClient.web3Util.getTokenBalance(this.tokens[0].code, address),
			await relayerClient.web3Util.getTokenBalance(this.tokens[1].code, address)
		];
		Util.logDebug('token balances: ' + JSON.stringify(this.tokenBalances));
		await this.checkAllowance(relayerClient.web3Util, dualClassWrapper);
		await this.maintainBalance(relayerClient.web3Util, dualClassWrapper);
		relayerClient.subscribeOrderHistory(this.makerAccount.address);
		return dualClassWrapper;
	}
}
