// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
import { DualClassWrapper } from '@finbook/duo-contract-wrapper';
// import { Constants as DataConstants } from '@finbook/duo-market-data';
// import { Util } from '@finbook/israfel-common';
import dualMarketMaker from './dualMarketMaker';

const tokens = [
	{
		custodian: '0x56e2727e56F9D6717e462418f822a8FE08Be4711',
		address: 'address',
		code: 'aETH',
		denomination: 0.1,
		precisions: {
			WETH: 0.000005
		},
		feeSchedules: {
			WETH: {
				minimum: 0.1,
				rate: 0
			}
		}
	},
	{
		custodian: '0x56e2727e56F9D6717e462418f822a8FE08Be4711',
		address: 'address',
		code: 'bETH',
		denomination: 0.1,
		precisions: {
			WETH: 0.000005
		},
		feeSchedules: {
			WETH: {
				minimum: 0.1,
				rate: 0
			}
		}
	}
];

const userOrders = [
	{
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 10,
		balance: 10,
		matching: 0,
		fill: 0,
		side: 'bid',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 1,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'add',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	},
	{
		account: 'account',
		pair: 'bETH|WETH',
		orderHash: 'orderHash2',
		price: 0.0011,
		amount: 10,
		balance: 12,
		matching: 0,
		fill: 0,
		side: 'bid',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 2,
		currentSequence: 2,
		fee: 0.1,
		feeAsset: 'bETH',
		type: 'add',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash2'
	},
	{
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash3',
		price: 0.0013,
		amount: 10,
		balance: 14,
		matching: 0,
		fill: 0,
		side: 'ask',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 3,
		currentSequence: 3,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'add',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash3'
	},
	{
		account: 'account',
		pair: 'bETH|WETH',
		orderHash: 'orderHash4',
		price: 0.0014,
		amount: 10,
		balance: 16,
		matching: 0,
		fill: 0,
		side: 'ask',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 4,
		currentSequence: 4,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'add',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash4'
	},
	{
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 10,
		balance: 10,
		matching: 0,
		fill: 0,
		side: 'bid',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 5,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'terminate',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	}
];

dualMarketMaker.makerAccount = {
	address: 'address',
	privateKey: 'privateKey'
};

const custodianStates = {
	resetPrice: 130,
	beta: 1,
	alpha: 1,
	createCommRate: 0.01,
	redeemCommRate: 0.01
};

test('handleOrderHistory not initlized', async () => {
	const marketMaker1 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker1.isInitialized = false;
	const dualClassWrapper = {} as any;
	const relayerClient = {
		subscribeOrderBook: jest.fn(() => Promise.resolve())
	} as any;
	marketMaker1.tokens = tokens;
	marketMaker1.tokenBalances = [100, 100, 100];
	marketMaker1.cancelOrders = jest.fn(() => Promise.resolve());
	marketMaker1.createOrderBookFromNav = jest.fn(() => Promise.resolve());
	await marketMaker1.handleOrderHistory(relayerClient, dualClassWrapper, userOrders);
	expect(marketMaker1.tokenBalances).toEqual([100, 100, 100]);
	expect(marketMaker1.cancelOrders).not.toBeCalled();
	expect(relayerClient.subscribeOrderBook).not.toBeCalled();
});

test('handleOrderHistory', async () => {
	const marketMaker1 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker1.isInitialized = true;
	const dualClassWrapper = {} as any;
	const relayerClient = {
		subscribeOrderBook: jest.fn(() => Promise.resolve())
	} as any;
	marketMaker1.tokens = tokens;
	marketMaker1.tokenBalances = [100, 100, 100];
	marketMaker1.cancelOrders = jest.fn(() => Promise.resolve());
	marketMaker1.createOrderBookFromNav = jest.fn(() => Promise.resolve());
	await marketMaker1.handleOrderHistory(relayerClient, dualClassWrapper, userOrders);
	expect(marketMaker1.tokenBalances).toMatchSnapshot();
	for (const mockCall of marketMaker1.cancelOrders.mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	expect(relayerClient.subscribeOrderBook.mock.calls).toMatchSnapshot();
});

test('handleOrderBookUpdate', async () => {
	const marketMaker2 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	const dualClassWrapper = {} as any;
	const relayerClient = {} as any;
	marketMaker2.makeOrders = jest.fn(() => Promise.resolve());

	await marketMaker2.handleOrderBookUpdate(dualClassWrapper, relayerClient, {
		pair: 'aETH|WETH'
	} as any);
	expect((marketMaker2.makeOrders as jest.Mock).mock.calls).toMatchSnapshot();
});

test('handleOrderError', () => {
	dualMarketMaker.pendingOrders = {
		orderHash: true
	};
	dualMarketMaker.handleOrderError('method', 'orderHash', 'error');
	expect(dualMarketMaker.pendingOrders).toEqual({});
});

test('handleUserOrder, terminate, bid', async () => {
	const marketMaker3 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker3.tokens = tokens;
	marketMaker3.tokenBalances = [6, 200, 200];
	marketMaker3.liveBidOrders = [
		[
			{
				account: 'account',
				pair: 'aETH|WETH',
				orderHash: 'orderHash1',
				price: 0.001,
				amount: 10,
				balance: 10,
				matching: 0,
				fill: 0,
				side: 'bid',
				expiry: 1234567890000,
				createdAt: 1234567880000,
				updatedAt: 1234567880000,
				initialSequence: 1,
				currentSequence: 1,
				fee: 0.1,
				feeAsset: 'aETH',
				type: 'add',
				status: 'confirmed',
				updatedBy: 'relayer',
				processed: true,
				transactionHash: 'transactionhash1'
			}
		],
		[]
	];
	const userOrder = {
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 10,
		balance: 10,
		matching: 0,
		fill: 0,
		side: 'bid',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 1,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'terminate',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	};
	marketMaker3.maintainBalance = jest.fn(() => Promise.resolve());
	marketMaker3.makeOrders = jest.fn(() => Promise.resolve());
	marketMaker3.pendingOrders = {
		orderHash1: true
	};
	await marketMaker3.handleUserOrder(userOrder, {} as any, {} as any);
	expect(marketMaker3.tokenBalances).toMatchSnapshot();
	expect(marketMaker3.makeOrders.mock.calls).toMatchSnapshot();
	expect(marketMaker3.pendingOrders).toEqual({});
});

test('handleUserOrder, terminate, bid bToken', async () => {
	const marketMaker3 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker3.tokens = tokens;
	marketMaker3.tokenBalances = [6, 200, 200];
	marketMaker3.liveBidOrders = [
		[],
		[
			{
				account: 'account',
				pair: 'bETH|WETH',
				orderHash: 'orderHash1',
				price: 0.001,
				amount: 10,
				balance: 10,
				matching: 0,
				fill: 0,
				side: 'bid',
				expiry: 1234567890000,
				createdAt: 1234567880000,
				updatedAt: 1234567880000,
				initialSequence: 1,
				currentSequence: 1,
				fee: 0.1,
				feeAsset: 'bETH',
				type: 'add',
				status: 'confirmed',
				updatedBy: 'relayer',
				processed: true,
				transactionHash: 'transactionhash1'
			}
		]
	];
	const userOrder = {
		account: 'account',
		pair: 'bETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 10,
		balance: 10,
		matching: 0,
		fill: 0,
		side: 'bid',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 1,
		fee: 0.1,
		feeAsset: 'bETH',
		type: 'terminate',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	};
	marketMaker3.maintainBalance = jest.fn(() => Promise.resolve());
	marketMaker3.makeOrders = jest.fn(() => Promise.resolve());
	await marketMaker3.handleUserOrder(userOrder, {} as any, {} as any);
	expect(marketMaker3.tokenBalances).toMatchSnapshot();
	expect(marketMaker3.makeOrders.mock.calls).toMatchSnapshot();
});

test('handleUserOrder, terminate, ask', async () => {
	const marketMaker3 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker3.tokens = tokens;
	marketMaker3.tokenBalances = [6, 200, 200];
	marketMaker3.liveAskOrders = [
		[
			{
				account: 'account',
				pair: 'aETH|WETH',
				orderHash: 'orderHash1',
				price: 0.001,
				amount: 10,
				balance: 10,
				matching: 0,
				fill: 0,
				side: 'ask',
				expiry: 1234567890000,
				createdAt: 1234567880000,
				updatedAt: 1234567880000,
				initialSequence: 1,
				currentSequence: 1,
				fee: 0.1,
				feeAsset: 'aETH',
				type: 'add',
				status: 'confirmed',
				updatedBy: 'relayer',
				processed: true,
				transactionHash: 'transactionhash1'
			}
		],
		[]
	];
	const userOrder = {
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 10,
		balance: 10,
		matching: 0,
		fill: 0,
		side: 'ask',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 1,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'terminate',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	};
	marketMaker3.maintainBalance = jest.fn(() => Promise.resolve());
	marketMaker3.makeOrders = jest.fn(() => Promise.resolve());
	await marketMaker3.handleUserOrder(userOrder, {} as any, {} as any);
	expect(marketMaker3.tokenBalances).toMatchSnapshot();
	expect(marketMaker3.makeOrders.mock.calls).toMatchSnapshot();
});

test('handleUserOrder, add, bid', async () => {
	const marketMaker3 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker3.tokens = tokens;
	marketMaker3.tokenBalances = [6, 200, 200];
	marketMaker3.liveBidOrders = [[], []];
	const userOrder = {
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 10,
		balance: 10,
		matching: 0,
		fill: 0,
		side: 'bid',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 1,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'add',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	};
	marketMaker3.maintainBalance = jest.fn(() => Promise.resolve());
	marketMaker3.makeOrders = jest.fn(() => Promise.resolve());
	await marketMaker3.handleUserOrder(userOrder, {} as any, {} as any);
	expect(marketMaker3.tokenBalances).toMatchSnapshot();
	expect(marketMaker3.makeOrders.mock.calls).toMatchSnapshot();
});

test('handleUserOrder, add, ask', async () => {
	const marketMaker3 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker3.tokens = tokens;
	marketMaker3.tokenBalances = [6, 200, 200];
	marketMaker3.liveAskOrders = [
		[
			{
				account: 'account',
				pair: 'aETH|WETH',
				orderHash: 'orderHash2',
				price: 0.001,
				amount: 10,
				balance: 10,
				matching: 0,
				fill: 0,
				side: 'ask',
				expiry: 1234567890000,
				createdAt: 1234567880000,
				updatedAt: 1234567880000,
				initialSequence: 1,
				currentSequence: 1,
				fee: 0.1,
				feeAsset: 'aETH',
				type: 'add',
				status: 'confirmed',
				updatedBy: 'relayer',
				processed: true,
				transactionHash: 'transactionhash2'
			}
		],
		[]
	];
	const userOrder = {
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 10,
		balance: 10,
		matching: 0,
		fill: 0,
		side: 'ask',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 1,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'add',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	};
	marketMaker3.maintainBalance = jest.fn(() => Promise.resolve());
	marketMaker3.makeOrders = jest.fn(() => Promise.resolve());
	await marketMaker3.handleUserOrder(userOrder, {} as any, {} as any);
	expect(marketMaker3.tokenBalances).toMatchSnapshot();
	expect(marketMaker3.makeOrders.mock.calls).toMatchSnapshot();
});

test('handleUserOrder, add, cancel too far away', async () => {
	const marketMaker4 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker4.tokens = tokens;
	marketMaker4.tokenBalances = [6, 200, 200];
	marketMaker4.liveBidOrders = [
		[
			{
				account: 'account',
				pair: 'aETH|WETH',
				orderHash: 'orderHash2',
				price: 0.0011,
				amount: 10,
				balance: 10,
				matching: 0,
				fill: 0,
				side: 'bid',
				expiry: 1234567890000
			} as any,
			{
				account: 'account',
				pair: 'aETH|WETH',
				orderHash: 'orderHash3',
				price: 0.0012,
				amount: 10,
				balance: 10,
				matching: 0,
				fill: 0,
				side: 'bid',
				expiry: 1234567890000
			} as any,
			{
				account: 'account',
				pair: 'aETH|WETH',
				orderHash: 'orderHash4',
				price: 0.0014,
				amount: 10,
				balance: 10,
				matching: 0,
				fill: 0,
				side: 'bid',
				expiry: 1234567890000
			} as any,
			{
				account: 'account',
				pair: 'aETH|WETH',
				orderHash: 'orderHash5',
				price: 0.0015,
				amount: 10,
				balance: 10,
				matching: 0,
				fill: 0,
				side: 'bid',
				expiry: 1234567890000
			}
		],
		[]
	];
	const userOrder = {
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 10,
		balance: 10,
		matching: 0,
		fill: 0,
		side: 'bid',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 1,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'add',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	};
	marketMaker4.maintainBalance = jest.fn(() => Promise.resolve());
	marketMaker4.makeOrders = jest.fn(() => Promise.resolve());
	marketMaker4.cancelOrders = jest.fn(() => Promise.resolve());
	await marketMaker4.handleUserOrder(userOrder, {} as any, {} as any);
	expect(marketMaker4.tokenBalances).toMatchSnapshot();
	expect(marketMaker4.makeOrders.mock.calls).toMatchSnapshot();
	for (const mockCall of marketMaker4.cancelOrders.mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
});

test('handleUserOrder, update, bid', async () => {
	const marketMaker3 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker3.tokens = tokens;
	marketMaker3.tokenBalances = [6, 200, 200];
	marketMaker3.liveBidOrders = [
		[
			{
				account: 'account',
				pair: 'aETH|WETH',
				orderHash: 'orderHash1',
				price: 0.001,
				amount: 100,
				balance: 80,
				matching: 0,
				fill: 0,
				side: 'bid',
				expiry: 1234567890000,
				createdAt: 1234567880000,
				updatedAt: 1234567880000,
				initialSequence: 1,
				currentSequence: 1,
				fee: 0.1,
				feeAsset: 'aETH',
				type: 'update',
				status: 'confirmed',
				updatedBy: 'relayer',
				processed: true,
				transactionHash: 'transactionhash1'
			}
		],
		[]
	];
	const userOrder = {
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 100,
		balance: 40,
		matching: 0,
		fill: 0,
		side: 'bid',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 1,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'update',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	};
	marketMaker3.maintainBalance = jest.fn(() => Promise.resolve());
	marketMaker3.makeOrders = jest.fn(() => Promise.resolve());
	await marketMaker3.handleUserOrder(userOrder, {} as any, {} as any);
	expect(marketMaker3.tokenBalances).toMatchSnapshot();
	expect(marketMaker3.makeOrders.mock.calls).toMatchSnapshot();
});

test('handleUserOrder, update, ask', async () => {
	const marketMaker3 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker3.tokens = tokens;
	marketMaker3.tokenBalances = [6, 200, 200];
	marketMaker3.liveAskOrders = [
		[
			{
				account: 'account',
				pair: 'aETH|WETH',
				orderHash: 'orderHash1',
				price: 0.001,
				amount: 100,
				balance: 80,
				matching: 0,
				fill: 0,
				side: 'ask',
				expiry: 1234567890000,
				createdAt: 1234567880000,
				updatedAt: 1234567880000,
				initialSequence: 1,
				currentSequence: 1,
				fee: 0.1,
				feeAsset: 'aETH',
				type: 'add',
				status: 'confirmed',
				updatedBy: 'relayer',
				processed: true,
				transactionHash: 'transactionhash1'
			}
		],
		[]
	];
	const userOrder = {
		account: 'account',
		pair: 'aETH|WETH',
		orderHash: 'orderHash1',
		price: 0.001,
		amount: 100,
		balance: 40,
		matching: 0,
		fill: 0,
		side: 'ask',
		expiry: 1234567890000,
		createdAt: 1234567880000,
		updatedAt: 1234567880000,
		initialSequence: 1,
		currentSequence: 1,
		fee: 0.1,
		feeAsset: 'aETH',
		type: 'update',
		status: 'confirmed',
		updatedBy: 'relayer',
		processed: true,
		transactionHash: 'transactionhash1'
	};
	marketMaker3.maintainBalance = jest.fn(() => Promise.resolve());
	marketMaker3.makeOrders = jest.fn(() => Promise.resolve());
	await marketMaker3.handleUserOrder(userOrder, {} as any, {} as any);
	expect(marketMaker3.tokenBalances).toMatchSnapshot();
	expect(marketMaker3.makeOrders.mock.calls).toMatchSnapshot();
});

// const custodianStates = {
// 	resetPrice: 130,
// 	beta: 1,
// 	alpha: 1,
// 	createCommRate: 0.01,
// 	redeemCommRate: 0.01
// };

test('maintainBalance, isMaintainingBalance', async () => {
	const marketMaker5 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker5.isMaintainingBalance = true;
	const web3Util = {
		getGasPrice: jest.fn(() => 9000000000),
		tokenTransfer: jest.fn(() => Promise.resolve()),
		awaitTransactionSuccessAsync: jest.fn(() => Promise.resolve())
	} as any;

	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates)),
		createRaw: jest.fn(() => Promise.resolve()),
		redeem: jest.fn(() => Promise.resolve()),
		wrapEther: jest.fn(() => Promise.resolve())
	} as any;
	await marketMaker5.maintainBalance(web3Util, dualClassWrapper);
	expect(web3Util.getGasPrice).not.toBeCalled();
	expect(web3Util.tokenTransfer).not.toBeCalled();
	expect(web3Util.awaitTransactionSuccessAsync).not.toBeCalled();
	expect(dualClassWrapper.getStates).not.toBeCalled();
	expect(dualClassWrapper.createRaw).not.toBeCalled();
	expect(dualClassWrapper.redeem).not.toBeCalled();
	expect(dualClassWrapper.wrapEther).not.toBeCalled();
	expect(marketMaker5.isMaintainingBalance).toBeTruthy();
});

test('maintainBalance, short of token', async () => {
	const marketMaker6 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker6.isMaintainingBalance = false;
	const web3Util = {
		getGasPrice: jest.fn(() => 9000000000),
		tokenTransfer: jest.fn(() => Promise.resolve()),
		awaitTransactionSuccessAsync: jest.fn(() => Promise.resolve('txHash')),
		contractAddresses: {
			etherToken: 'wethAddr'
		}
	} as any;

	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates)),
		create: jest.fn(() => Promise.resolve('createRawHash')),
		redeem: jest.fn(() => Promise.resolve('redeemHash')),
		wrapEther: jest.fn(() => Promise.resolve('wrapEtherHash'))
	} as any;
	marketMaker6.tokenBalances = [11, 50, 50];
	await marketMaker6.maintainBalance(web3Util, dualClassWrapper);
	expect(marketMaker6.tokenBalances).toMatchSnapshot();
	expect(dualClassWrapper.create.mock.calls).toMatchSnapshot();
	expect(web3Util.getGasPrice).toBeCalledTimes(1);
	expect(web3Util.awaitTransactionSuccessAsync).toBeCalledTimes(1);
	expect(web3Util.tokenTransfer).not.toBeCalled();
	expect(dualClassWrapper.getStates).toBeCalledTimes(1);
	expect(dualClassWrapper.redeem).not.toBeCalled();
	expect(dualClassWrapper.wrapEther).not.toBeCalled();
	expect(marketMaker6.isMaintainingBalance).toBeFalsy();
});

test('maintainBalance, surplus of token', async () => {
	const marketMaker7 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker7.isMaintainingBalance = false;
	const web3Util = {
		getGasPrice: jest.fn(() => 9000000000),
		tokenTransfer: jest.fn(() => Promise.resolve()),
		awaitTransactionSuccessAsync: jest.fn(() => Promise.resolve('txHash')),
		wrapEther: jest.fn(() => Promise.resolve('wrapTxHash')),
		contractAddresses: {
			etherToken: 'wethAddr'
		}
	} as any;

	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates)),
		createRaw: jest.fn(() => Promise.resolve('createRawHash')),
		redeem: jest.fn(() => Promise.resolve('redeemHash')),
		wrapEther: jest.fn(() => Promise.resolve('wrapEtherHash'))
	} as any;
	marketMaker7.tokenBalances = [2, 500, 500];
	await marketMaker7.maintainBalance(web3Util, dualClassWrapper);
	expect(marketMaker7.tokenBalances).toMatchSnapshot();
	expect(dualClassWrapper.redeem.mock.calls).toMatchSnapshot();
	expect(web3Util.wrapEther.mock.calls).toMatchSnapshot();
	expect(web3Util.getGasPrice).toBeCalledTimes(1);
	expect(web3Util.awaitTransactionSuccessAsync).toBeCalledTimes(2);
	expect(web3Util.tokenTransfer).not.toBeCalled();
	expect(dualClassWrapper.createRaw).not.toBeCalled();
});

test('maintainBalance, surplus of weth', async () => {
	const marketMaker8 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker8.isMaintainingBalance = false;
	const web3Util = {
		getGasPrice: jest.fn(() => 9000000000),
		tokenTransfer: jest.fn(() => Promise.resolve('tokenTransferTxHash')),
		awaitTransactionSuccessAsync: jest.fn(() => Promise.resolve('txHash')),
		wrapEther: jest.fn(() => Promise.resolve('wrapTxHash')),
		contractAddresses: {
			etherToken: 'wethAddr'
		}
	} as any;

	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates)),
		createRaw: jest.fn(() => Promise.resolve('createRawHash')),
		redeem: jest.fn(() => Promise.resolve('redeemHash')),
		wrapEther: jest.fn(() => Promise.resolve('wrapEtherHash'))
	} as any;
	marketMaker8.tokenBalances = [12, 200, 200];
	await marketMaker8.maintainBalance(web3Util, dualClassWrapper);
	expect(marketMaker8.tokenBalances).toMatchSnapshot();
	expect(web3Util.tokenTransfer.mock.calls).toMatchSnapshot();
	expect(web3Util.wrapEther).not.toBeCalled();
	expect(web3Util.getGasPrice).toBeCalledTimes(1);
	expect(web3Util.awaitTransactionSuccessAsync).toBeCalledTimes(1);
	expect(dualClassWrapper.redeem).not.toBeCalled();
	expect(dualClassWrapper.createRaw).not.toBeCalled();
});

test('maintainBalance, short of weth', async () => {
	const marketMaker9 = Object.assign(
		Object.create(Object.getPrototypeOf(dualMarketMaker)),
		dualMarketMaker
	);
	marketMaker9.isMaintainingBalance = false;
	const web3Util = {
		getGasPrice: jest.fn(() => 9000000000),
		tokenTransfer: jest.fn(() => Promise.resolve('tokenTransferTxHash')),
		awaitTransactionSuccessAsync: jest.fn(() => Promise.resolve('txHash')),
		wrapEther: jest.fn(() => Promise.resolve('wrapTxHash')),
		contractAddresses: {
			etherToken: 'wethAddr'
		}
	} as any;

	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates)),
		createRaw: jest.fn(() => Promise.resolve('createRawHash')),
		redeem: jest.fn(() => Promise.resolve('redeemHash')),
		wrapEther: jest.fn(() => Promise.resolve('wrapEtherHash'))
	} as any;
	marketMaker9.tokenBalances = [1, 200, 200];
	await marketMaker9.maintainBalance(web3Util, dualClassWrapper);
	expect(marketMaker9.tokenBalances).toMatchSnapshot();
	expect(web3Util.tokenTransfer.mock.calls).toMatchSnapshot();
	expect(web3Util.wrapEther).not.toBeCalled();
	expect(web3Util.getGasPrice).toBeCalledTimes(1);
	expect(web3Util.awaitTransactionSuccessAsync).toBeCalledTimes(1);
	expect(dualClassWrapper.redeem).not.toBeCalled();
	expect(dualClassWrapper.createRaw).not.toBeCalled();
});

test('createOrderBookFromNav', async () => {
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 100);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	await dualMarketMaker.createOrderBookFromNav(dualClassWrapper, {} as any);
	expect((dualMarketMaker.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
});

test('makeOrders, isMakingOrders', async () => {
	dualMarketMaker.isMakingOrders = true;
	dualMarketMaker.getEthPrice = jest.fn(() => 100);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [],
				asks: []
			},
			'bETH|WETH': { version: 1, pair: 'bETH', bids: [], asks: [] }
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH');
	expect(dualClassWrapper.getStates as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.getEthPrice as jest.Mock).not.toBeCalled();
	expect(DualClassWrapper.calculateNav as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.createOrderBookSide as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.cancelOrders as jest.Mock).not.toBeCalled();
});

test('makeOrders, no need to create order', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006405,
						balance: 20,
						count: 1
					},
					{
						price: 0.006305,
						balance: 20,
						count: 1
					},
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006605,
						balance: 20,
						count: 1
					},
					{
						price: 0.006705,
						balance: 20,
						count: 1
					},
					{
						price: 0.006805,
						balance: 20,
						count: 1
					},
					{
						price: 0.006905,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0087,
						balance: 20,
						count: 1
					},
					{
						price: 0.0086,
						balance: 20,
						count: 1
					},
					{
						price: 0.0085,
						balance: 20,
						count: 1
					},
					{
						price: 0.0084,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0088,
						balance: 20,
						count: 1
					},
					{
						price: 0.0089,
						balance: 20,
						count: 1
					},
					{
						price: 0.009,
						balance: 20,
						count: 1
					},
					{
						price: 0.0091,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH|WETH');
	expect(dualMarketMaker.createOrderBookSide as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.cancelOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('makeOrders, no need to create order, bToken', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006405,
						balance: 20,
						count: 1
					},
					{
						price: 0.006305,
						balance: 20,
						count: 1
					},
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006605,
						balance: 20,
						count: 1
					},
					{
						price: 0.006705,
						balance: 20,
						count: 1
					},
					{
						price: 0.006805,
						balance: 20,
						count: 1
					},
					{
						price: 0.006905,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0087,
						balance: 20,
						count: 1
					},
					{
						price: 0.0086,
						balance: 20,
						count: 1
					},
					{
						price: 0.0085,
						balance: 20,
						count: 1
					},
					{
						price: 0.0084,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0088,
						balance: 20,
						count: 1
					},
					{
						price: 0.0089,
						balance: 20,
						count: 1
					},
					{
						price: 0.009,
						balance: 20,
						count: 1
					},
					{
						price: 0.0091,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'bETH|WETH');
	expect(dualMarketMaker.createOrderBookSide as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.cancelOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('makeOrders, create bid order, no spread change', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006305,
						balance: 20,
						count: 1
					},
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006405,
						balance: 20,
						count: 1
					},
					{
						price: 0.006505,
						balance: 20,
						count: 1
					},
					{
						price: 0.006605,
						balance: 20,
						count: 1
					},
					{
						price: 0.006705,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0087,
						balance: 20,
						count: 1
					},
					{
						price: 0.0086,
						balance: 20,
						count: 1
					},
					{
						price: 0.0085,
						balance: 20,
						count: 1
					},
					{
						price: 0.0084,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0091,
						balance: 20,
						count: 1
					},
					{
						price: 0.0092,
						balance: 20,
						count: 1
					},
					{
						price: 0.0093,
						balance: 20,
						count: 1
					},
					{
						price: 0.0094,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH|WETH');
	for (const mockCall of (dualMarketMaker.createOrderBookSide as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	expect(dualMarketMaker.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.cancelOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('makeOrders, create ask order, no spread change', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006305,
						balance: 20,
						count: 1
					},
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					},
					{
						price: 0.006095,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006505,
						balance: 20,
						count: 1
					},
					{
						price: 0.006805,
						balance: 20,
						count: 1
					},
					{
						price: 0.006905,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0087,
						balance: 20,
						count: 1
					},
					{
						price: 0.0086,
						balance: 20,
						count: 1
					},
					{
						price: 0.0085,
						balance: 20,
						count: 1
					},
					{
						price: 0.0084,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0091,
						balance: 20,
						count: 1
					},
					{
						price: 0.0092,
						balance: 20,
						count: 1
					},
					{
						price: 0.0093,
						balance: 20,
						count: 1
					},
					{
						price: 0.0094,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH|WETH');
	for (const mockCall of (dualMarketMaker.createOrderBookSide as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	expect(dualMarketMaker.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.cancelOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('makeOrders, create bid order, with spread change', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.lastMid = [0.006505, 0.0087];
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					},
					{
						price: 0.006005,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006605,
						balance: 20,
						count: 1
					},
					{
						price: 0.006705,
						balance: 20,
						count: 1
					},
					{
						price: 0.006805,
						balance: 20,
						count: 1
					},
					{
						price: 0.006905,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0087,
						balance: 20,
						count: 1
					},
					{
						price: 0.0086,
						balance: 20,
						count: 1
					},
					{
						price: 0.0085,
						balance: 20,
						count: 1
					},
					{
						price: 0.0084,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0091,
						balance: 20,
						count: 1
					},
					{
						price: 0.0092,
						balance: 20,
						count: 1
					},
					{
						price: 0.0093,
						balance: 20,
						count: 1
					},
					{
						price: 0.0094,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH|WETH');
	for (const mockCall of (dualMarketMaker.createOrderBookSide as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	expect(dualMarketMaker.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.cancelOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('makeOrders, create bid order, with spread change, no need to fill', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.lastMid = [0.006705, 0.0087];
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006305,
						balance: 20,
						count: 1
					},
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					},
					{
						price: 0.006005,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006705,
						balance: 20,
						count: 1
					},
					{
						price: 0.006805,
						balance: 20,
						count: 1
					},
					{
						price: 0.006905,
						balance: 20,
						count: 1
					},
					{
						price: 0.007005,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0087,
						balance: 20,
						count: 1
					},
					{
						price: 0.0086,
						balance: 20,
						count: 1
					},
					{
						price: 0.0085,
						balance: 20,
						count: 1
					},
					{
						price: 0.0084,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0091,
						balance: 20,
						count: 1
					},
					{
						price: 0.0092,
						balance: 20,
						count: 1
					},
					{
						price: 0.0093,
						balance: 20,
						count: 1
					},
					{
						price: 0.0094,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH|WETH');
	for (const mockCall of (dualMarketMaker.createOrderBookSide as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	expect(dualMarketMaker.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.cancelOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('makeOrders, create ask order, with spread change', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.lastMid = [0.006405, 0.0087];
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006305,
						balance: 20,
						count: 1
					},
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					},
					{
						price: 0.006005,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006705,
						balance: 20,
						count: 1
					},
					{
						price: 0.006805,
						balance: 20,
						count: 1
					},
					{
						price: 0.006905,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0087,
						balance: 20,
						count: 1
					},
					{
						price: 0.0086,
						balance: 20,
						count: 1
					},
					{
						price: 0.0085,
						balance: 20,
						count: 1
					},
					{
						price: 0.0084,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0091,
						balance: 20,
						count: 1
					},
					{
						price: 0.0092,
						balance: 20,
						count: 1
					},
					{
						price: 0.0093,
						balance: 20,
						count: 1
					},
					{
						price: 0.0094,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH|WETH');
	for (const mockCall of (dualMarketMaker.createOrderBookSide as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	expect(dualMarketMaker.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.cancelOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('makeOrders, create ask order, with spread change, no need to fill', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.lastMid = [0.006305, 0.0087];
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006305,
						balance: 20,
						count: 1
					},
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					},
					{
						price: 0.006005,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006705,
						balance: 20,
						count: 1
					},
					{
						price: 0.006805,
						balance: 20,
						count: 1
					},
					{
						price: 0.006905,
						balance: 20,
						count: 1
					},
					{
						price: 0.007005,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0087,
						balance: 20,
						count: 1
					},
					{
						price: 0.0086,
						balance: 20,
						count: 1
					},
					{
						price: 0.0085,
						balance: 20,
						count: 1
					},
					{
						price: 0.0084,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0091,
						balance: 20,
						count: 1
					},
					{
						price: 0.0092,
						balance: 20,
						count: 1
					},
					{
						price: 0.0093,
						balance: 20,
						count: 1
					},
					{
						price: 0.0094,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH|WETH');
	for (const mockCall of (dualMarketMaker.createOrderBookSide as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	expect(dualMarketMaker.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.cancelOrders as jest.Mock).not.toBeCalled();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('makeOrders, arbitrage occurs, take asks', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.liveAskOrders = [
		[],
		[
			{
				price: 0.0082,
				orderHash: 'askToCancelOrderHash'
			} as any,
			{
				price: 0.01,
				orderHash: 'askToKeeyOrderHash'
			}
		]
	];
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006405,
						balance: 20,
						count: 1
					},
					{
						price: 0.006305,
						balance: 20,
						count: 1
					},
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006605,
						balance: 20,
						count: 1
					},
					{
						price: 0.006705,
						balance: 20,
						count: 1
					},
					{
						price: 0.006805,
						balance: 20,
						count: 1
					},
					{
						price: 0.006905,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0084,
						balance: 20,
						count: 1
					},
					{
						price: 0.0083,
						balance: 20,
						count: 1
					},
					{
						price: 0.0082,
						balance: 20,
						count: 1
					},
					{
						price: 0.0081,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0082,
						balance: 20,
						count: 1
					},
					{
						price: 0.0083,
						balance: 20,
						count: 1
					},
					{
						price: 0.0084,
						balance: 20,
						count: 1
					},
					{
						price: 0.0085,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH|WETH');

	expect(dualMarketMaker.createOrderBookSide as jest.Mock).not.toBeCalled();
	for (const mockCall of (dualMarketMaker.takeOneSideOrders as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	for (const mockCall of (dualMarketMaker.cancelOrders as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('makeOrders, arbitrage occurs, take bids', async () => {
	dualMarketMaker.isMakingOrders = false;
	dualMarketMaker.canMakeOrder = jest.fn(() => true);
	dualMarketMaker.tokens = tokens;
	dualMarketMaker.getEthPrice = jest.fn(() => 150);
	DualClassWrapper.calculateNav = jest.fn(() => [1, 1.2]);
	dualMarketMaker.createOrderBookSide = jest.fn(() => Promise.resolve());
	dualMarketMaker.takeOneSideOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.cancelOrders = jest.fn(() => Promise.resolve());
	dualMarketMaker.liveBidOrders = [
		[],
		[
			{
				price: 0.0091,
				orderHash: 'bidToCancelOrderHash'
			} as any,
			{
				price: 0.0089,
				orderHash: 'bidToKeepOrderHash'
			} as any
		]
	];
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [
					{
						price: 0.006405,
						balance: 20,
						count: 1
					},
					{
						price: 0.006305,
						balance: 20,
						count: 1
					},
					{
						price: 0.006205,
						balance: 20,
						count: 1
					},
					{
						price: 0.006105,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.006605,
						balance: 20,
						count: 1
					},
					{
						price: 0.006705,
						balance: 20,
						count: 1
					},
					{
						price: 0.006805,
						balance: 20,
						count: 1
					},
					{
						price: 0.006905,
						balance: 20,
						count: 1
					}
				]
			},
			'bETH|WETH': {
				version: 1,
				pair: 'bETH',
				bids: [
					{
						price: 0.0091,
						balance: 20,
						count: 1
					},
					{
						price: 0.009,
						balance: 20,
						count: 1
					},
					{
						price: 0.0089,
						balance: 20,
						count: 1
					},
					{
						price: 0.0088,
						balance: 20,
						count: 1
					}
				],
				asks: [
					{
						price: 0.0092,
						balance: 20,
						count: 1
					},
					{
						price: 0.0093,
						balance: 20,
						count: 1
					},
					{
						price: 0.0094,
						balance: 20,
						count: 1
					},
					{
						price: 0.0095,
						balance: 20,
						count: 1
					}
				]
			}
		}
	} as any;
	const dualClassWrapper = {
		getStates: jest.fn(() => Promise.resolve(custodianStates))
	} as any;
	await dualMarketMaker.makeOrders(relayerClient, dualClassWrapper, 'aETH|WETH');
	expect(dualMarketMaker.createOrderBookSide as jest.Mock).not.toBeCalled();
	for (const mockCall of (dualMarketMaker.takeOneSideOrders as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	for (const mockCall of (dualMarketMaker.cancelOrders as jest.Mock).mock.calls)
		expect(mockCall.slice(1)).toMatchSnapshot();
	expect(dualMarketMaker.lastMid).toMatchSnapshot();
});

test('connectToRelayer', () => {
	const relayerClient = {
		onInfoUpdate: jest.fn(),
		onOrder: jest.fn(),
		onOrderBook: jest.fn(),
		onConnection: jest.fn(),
		connectToRelayer: jest.fn()
	};
	global.setInterval = jest.fn();
	dualMarketMaker.connectToRelayer(relayerClient as any, {} as any);
	expect(relayerClient.onInfoUpdate.mock.calls).toMatchSnapshot();
	expect(relayerClient.onOrder.mock.calls).toMatchSnapshot();
	expect(relayerClient.onOrderBook.mock.calls).toMatchSnapshot();
	expect(relayerClient.onConnection.mock.calls).toMatchSnapshot();
	expect(relayerClient.connectToRelayer).toBeCalledTimes(1);
	expect((global.setInterval as jest.Mock).mock.calls).toMatchSnapshot();
});
