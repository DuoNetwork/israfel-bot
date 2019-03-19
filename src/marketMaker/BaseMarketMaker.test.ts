// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
// import { DualClassWrapper } from '@finbook/duo-contract-wrapper';
import { Constants as DataConstants } from '@finbook/duo-market-data';
import { Util } from '@finbook/israfel-common';
import BaseMarketMaker from './BaseMarketMaker';

const baseMarketMaker = new BaseMarketMaker();

// const userOrders = [
	// {
	// 	account: 'account',
	// 	pair: 'aETH|WETH',
	// 	orderHash: 'orderHash1',
	// 	price: 0.001,
	// 	amount: 10,
	// 	balance: 10,
	// 	matching: 0,
	// 	fill: 0,
	// 	side: 'bid',
	// 	expiry: 1234567890000,
	// 	createdAt: 1234567880000,
	// 	updatedAt: 1234567880000,
	// 	initialSequence: 1,
	// 	currentSequence: 1,
	// 	fee: 0.1,
	// 	feeAsset: 'aETH',
	// 	type: 'add',
	// 	status: 'confirmed',
	// 	updatedBy: 'relayer',
	// 	processed: true,
	// 	transactionHash: 'transactionhash1'
	// },
	// {
	// 	account: 'account',
	// 	pair: 'bETH|WETH',
	// 	orderHash: 'orderHash2',
	// 	price: 0.0011,
	// 	amount: 10,
	// 	balance: 12,
	// 	matching: 0,
	// 	fill: 0,
	// 	side: 'bid',
	// 	expiry: 1234567890000,
	// 	createdAt: 1234567880000,
	// 	updatedAt: 1234567880000,
	// 	initialSequence: 2,
	// 	currentSequence: 2,
	// 	fee: 0.1,
	// 	feeAsset: 'bETH',
	// 	type: 'add',
	// 	status: 'confirmed',
	// 	updatedBy: 'relayer',
	// 	processed: true,
	// 	transactionHash: 'transactionhash2'
	// },
	// {
	// 	account: 'account',
	// 	pair: 'aETH|WETH',
	// 	orderHash: 'orderHash3',
	// 	price: 0.0013,
	// 	amount: 10,
	// 	balance: 14,
	// 	matching: 0,
	// 	fill: 0,
	// 	side: 'ask',
	// 	expiry: 1234567890000,
	// 	createdAt: 1234567880000,
	// 	updatedAt: 1234567880000,
	// 	initialSequence: 3,
	// 	currentSequence: 3,
	// 	fee: 0.1,
	// 	feeAsset: 'aETH',
	// 	type: 'add',
	// 	status: 'confirmed',
	// 	updatedBy: 'relayer',
	// 	processed: true,
	// 	transactionHash: 'transactionhash3'
	// },
	// {
	// 	account: 'account',
	// 	pair: 'bETH|WETH',
	// 	orderHash: 'orderHash4',
	// 	price: 0.0014,
	// 	amount: 10,
	// 	balance: 16,
	// 	matching: 0,
	// 	fill: 0,
	// 	side: 'ask',
	// 	expiry: 1234567890000,
	// 	createdAt: 1234567880000,
	// 	updatedAt: 1234567880000,
	// 	initialSequence: 4,
	// 	currentSequence: 4,
	// 	fee: 0.1,
	// 	feeAsset: 'aETH',
	// 	type: 'add',
	// 	status: 'confirmed',
	// 	updatedBy: 'relayer',
	// 	processed: true,
	// 	transactionHash: 'transactionhash4'
	// },
	// {
	// 	account: 'account',
	// 	pair: 'aETH|WETH',
	// 	orderHash: 'orderHash1',
	// 	price: 0.001,
	// 	amount: 10,
	// 	balance: 10,
	// 	matching: 0,
	// 	fill: 0,
	// 	side: 'bid',
	// 	expiry: 1234567890000,
	// 	createdAt: 1234567880000,
	// 	updatedAt: 1234567880000,
	// 	initialSequence: 1,
	// 	currentSequence: 5,
	// 	fee: 0.1,
	// 	feeAsset: 'aETH',
	// 	type: 'terminate',
	// 	status: 'confirmed',
	// 	updatedBy: 'relayer',
	// 	processed: true,
	// 	transactionHash: 'transactionhash1'
// 	}
// ];

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

const option = {
	env: 'dev',
	tokens: [],
	token: 'aETH',
	contractType: 'Beethoven',
	maker: 0,
	spender: 1,
	amount: 10,
	debug: true,
	server: false
};

baseMarketMaker.makerAccount = {
	address: 'address',
	privateKey: 'privateKey'
};
test('checkAllowance, already approved', async () => {
	const web3Util = {
		getTokenAllowance: jest.fn(() => Promise.resolve(10000)),
		setUnlimitedTokenAllowance: jest.fn(() => Promise.resolve()),
		awaitTransactionSuccessAsync: jest.fn(() => Promise.resolve())
	} as any;

	const dualClassWrapper1 = {
		address: 'custodianAddr'
	} as any;
	baseMarketMaker.tokens = tokens;
	await baseMarketMaker.checkAllowance(web3Util, dualClassWrapper1);
	expect((web3Util.getTokenAllowance as jest.Mock).mock.calls).toMatchSnapshot();
	expect(web3Util.setUnlimitedTokenAllowance as jest.Mock).not.toBeCalled();
	expect(web3Util.awaitTransactionSuccessAsync as jest.Mock).not.toBeCalled();
});

test('checkAllowance, 0 allowance', async () => {
	const web3Util = {
		getTokenAllowance: jest.fn(() => Promise.resolve(0)),
		setUnlimitedTokenAllowance: jest.fn((code: string, addr: string, custodianAddr?: string) =>
			Promise.resolve(`${code}|
	${addr}|${custodianAddr}`)
		),
		awaitTransactionSuccessAsync: jest.fn(() => Promise.resolve())
	} as any;

	const dualClassWrapper1 = {
		address: 'custodianAddr'
	} as any;
	baseMarketMaker.tokens = tokens;
	await baseMarketMaker.checkAllowance(web3Util, dualClassWrapper1);
	expect((web3Util.getTokenAllowance as jest.Mock).mock.calls).toMatchSnapshot();
	expect((web3Util.setUnlimitedTokenAllowance as jest.Mock).mock.calls).toMatchSnapshot();
	expect((web3Util.awaitTransactionSuccessAsync as jest.Mock).mock.calls).toMatchSnapshot();
});

test('initialize, no a token', async () => {
	const web3Util = {
		getTokenByCode: jest.fn(() => null),
		tokens: [],
		getTokenBalance: jest.fn(() => Promise.resolve(10))
	} as any;
	const relayerClient = {
		web3Util: web3Util,
		subscribeOrderBook: jest.fn(() => Promise.resolve())
	} as any;

	try {
		await baseMarketMaker.initialize(relayerClient, option);
		expect(false).toBeTruthy();
	} catch (err) {
		expect(err).toMatchSnapshot();
	}
});

test('initialize, no b token', async () => {
	const web3Util = {
		getTokenByCode: jest.fn(() => 'aETH'),
		tokens: [tokens[0]],
		getTokenBalance: jest.fn(() => Promise.resolve(10))
	} as any;
	const relayerClient = {
		web3Util: web3Util,
		subscribeOrderBook: jest.fn(() => Promise.resolve())
	} as any;

	try {
		await baseMarketMaker.initialize(relayerClient, option);
		expect(false).toBeTruthy();
	} catch (err) {
		expect(err).toMatchSnapshot();
	}
});

test('initialize', async () => {
	const web3Util = {
		getTokenByCode: jest.fn(() => tokens[0]),
		tokens: tokens,
		getTokenBalance: jest.fn(() => Promise.resolve(10))
	} as any;
	const relayerClient = {
		web3Util: web3Util,
		subscribeOrderHistory: jest.fn(() => Promise.resolve())
	} as any;

	baseMarketMaker.checkAllowance = jest.fn(() => Promise.resolve());
	baseMarketMaker.maintainBalance = jest.fn(() => Promise.resolve());
	baseMarketMaker.getDualWrapper = jest.fn();

	await baseMarketMaker.initialize(relayerClient, option);
	expect((relayerClient.web3Util.getTokenByCode as jest.Mock).mock.calls).toMatchSnapshot();
	expect((relayerClient.web3Util.getTokenBalance as jest.Mock).mock.calls).toMatchSnapshot();
	expect((relayerClient.subscribeOrderHistory as jest.Mock).mock.calls).toMatchSnapshot();
});

test('cancelOrders', async () => {
	const relayerClient = {
		web3Util: {
			web3PersonalSign: jest.fn(() => Promise.resolve('signature'))
		},
		deleteOrder: jest.fn(() => Promise.resolve())
	} as any;
	await baseMarketMaker.cancelOrders(relayerClient, 'aETH|WETH', ['orderHash1', 'orderHash2']);
	expect((relayerClient.web3Util.web3PersonalSign as jest.Mock).mock.calls).toMatchSnapshot();
	expect((relayerClient.deleteOrder as jest.Mock).mock.calls).toMatchSnapshot();
	expect(baseMarketMaker.pendingOrders).toMatchSnapshot();
});

test('canMakeOrder, no orderBookSnapshot', () => {
	baseMarketMaker.tokens = tokens;
	const relayerClient = {
		orderBookSnapshots: {}
	} as any;
	expect(baseMarketMaker.canMakeOrder(relayerClient, 'aETH|WETH')).toBeFalsy();
});

test('canMakeOrder, isSendingOrder', () => {
	baseMarketMaker.tokens = tokens;
	baseMarketMaker.isSendingOrder = true;
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [],
				asks: []
			},
			'bETH|WETH': { version: 1, pair: 'bETH|WETH', bids: [], asks: [] }
		}
	} as any;
	expect(baseMarketMaker.canMakeOrder(relayerClient, 'bETH|WETH')).toBeFalsy();
});

test('canMakeOrder, has pendingOrder', () => {
	baseMarketMaker.tokens = tokens;
	baseMarketMaker.isSendingOrder = true;
	baseMarketMaker.pendingOrders = { orderHash: true };
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [],
				asks: []
			},
			'bETH|WETH': { version: 1, pair: 'bETH|WETH', bids: [], asks: [] }
		}
	} as any;
	expect(baseMarketMaker.canMakeOrder(relayerClient, 'aETH|WETH')).toBeFalsy();
});

test('canMakeOrder', () => {
	baseMarketMaker.tokens = tokens;
	baseMarketMaker.isSendingOrder = false;
	baseMarketMaker.pendingOrders = {};
	const relayerClient = {
		orderBookSnapshots: {
			'aETH|WETH': {
				version: 1,
				pair: 'aETH|WETH',
				bids: [],
				asks: []
			},
			'bETH|WETH': { version: 1, pair: 'bETH|WETH', bids: [], asks: [] }
		}
	} as any;
	expect(baseMarketMaker.canMakeOrder(relayerClient, 'aETH|WETH')).toBeTruthy();
});

test('getEthPrice', () => {
	baseMarketMaker.exchangePrices[DataConstants.API_KRAKEN] = [
		{
			period: 1,
			open: 100,
			high: 200,
			low: 50,
			close: 150,
			volume: 10000,
			source: 'kraken',
			base: 'USD',
			quote: 'ETH',
			timestamp: 1234567890000
		}
	];
	expect(baseMarketMaker.getEthPrice()).toBe(150);
});

test('getEthPrice, no ETH price', () => {
	baseMarketMaker.exchangePrices[DataConstants.API_KRAKEN] = [];
	expect(baseMarketMaker.getEthPrice()).toBe(0);
});

test('takeOneSideOrders bid', async () => {
	const relayerClient = {
		addOrder: jest.fn(() => Promise.resolve('addOrderTxHash'))
	} as any;
	Util.getExpiryTimestamp = jest.fn(() => 1234567890000);
	Util.sleep = jest.fn(() => Promise.resolve()) as any;
	baseMarketMaker.pendingOrders = {};
	await baseMarketMaker.takeOneSideOrders(relayerClient, 'aETH|WETH', true, [
		{
			price: 0.001,
			balance: 20,
			count: 1
		},
		{
			price: 0.0012,
			balance: 0,
			count: 1
		},
		{
			price: 0.0014,
			balance: 20,
			count: 1
		}
	]);
	expect((relayerClient.addOrder as jest.Mock).mock.calls).toMatchSnapshot();
	expect(baseMarketMaker.pendingOrders).toMatchSnapshot();
});

test('takeOneSideOrders ask', async () => {
	const relayerClient = {
		addOrder: jest.fn(() => Promise.resolve('addOrderTxHash'))
	} as any;
	Util.getExpiryTimestamp = jest.fn(() => 1234567890000);
	Util.sleep = jest.fn(() => Promise.resolve()) as any;
	baseMarketMaker.pendingOrders = {};
	await baseMarketMaker.takeOneSideOrders(relayerClient, 'aETH|WETH', false, [
		{
			price: 0.001,
			balance: 20,
			count: 1
		},
		{
			price: 0.0012,
			balance: 0,
			count: 1
		},
		{
			price: 0.0014,
			balance: 20,
			count: 1
		}
	]);
	expect((relayerClient.addOrder as jest.Mock).mock.calls).toMatchSnapshot();
	expect(baseMarketMaker.pendingOrders).toMatchSnapshot();
});

test('createOrderBookSide bid', async () => {
	const relayerClient = {
		addOrder: jest.fn(() => Promise.resolve('addOrderTxHash'))
	} as any;
	Util.getExpiryTimestamp = jest.fn(() => 1234567890000);
	Util.sleep = jest.fn(() => Promise.resolve()) as any;
	Math.random = jest.fn(() => 0.5);
	baseMarketMaker.pendingOrders = {};
	await baseMarketMaker.createOrderBookSide(relayerClient, 'aETH|WETH', 0.0001, true, 4);
	expect((relayerClient.addOrder as jest.Mock).mock.calls).toMatchSnapshot();
	expect(baseMarketMaker.pendingOrders).toMatchSnapshot();
});

test('createOrderBookSide bid, no price adjustment', async () => {
	const relayerClient = {
		addOrder: jest.fn(() => Promise.resolve('addOrderTxHash'))
	} as any;
	Util.getExpiryTimestamp = jest.fn(() => 1234567890000);
	Util.sleep = jest.fn(() => Promise.resolve()) as any;
	Math.random = jest.fn(() => 0.5);
	baseMarketMaker.pendingOrders = {};
	await baseMarketMaker.createOrderBookSide(relayerClient, 'aETH|WETH', 0.0001, true, 4, false);
	expect((relayerClient.addOrder as jest.Mock).mock.calls).toMatchSnapshot();
	expect(baseMarketMaker.pendingOrders).toMatchSnapshot();
});

test('createOrderBookSide ask', async () => {
	const relayerClient = {
		addOrder: jest.fn(() => Promise.resolve('addOrderTxHash'))
	} as any;
	Util.getExpiryTimestamp = jest.fn(() => 1234567890000);
	Util.sleep = jest.fn(() => Promise.resolve()) as any;
	Math.random = jest.fn(() => 0.5);
	baseMarketMaker.pendingOrders = {};
	await baseMarketMaker.createOrderBookSide(relayerClient, 'aETH|WETH', 0.0001, false, 4);
	expect((relayerClient.addOrder as jest.Mock).mock.calls).toMatchSnapshot();
	expect(baseMarketMaker.pendingOrders).toMatchSnapshot();
});
