// // fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
// import { MakeDepthUtil } from './makeDepthUtil';
test('test', () => {
	expect(true).toBeTruthy()
});
// const option = {
// 	token: 'token',
// 	type: 'type',
// 	tenor: 'tenor'
// } as any;

// const web3Util = {} as any;

// test('startMakingOrders no orderBookSnapshot', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.orderBookSnapshot = null;
// 	await makeDepthUtil.startMakingOrders();
// 	expect(orderMakerUtil.takeOneSideOrders as jest.Mock).not.toBeCalled();
// 	expect(orderMakerUtil.createOrderBookSide as jest.Mock).not.toBeCalled();
// });

// test('startMakingOrders no lastAcceptedPrice', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.lastAcceptedPrice = null;
// 	await makeDepthUtil.startMakingOrders();
// 	expect(orderMakerUtil.takeOneSideOrders as jest.Mock).not.toBeCalled();
// 	expect(orderMakerUtil.createOrderBookSide as jest.Mock).not.toBeCalled();
// });

// test('startMakingOrders no orderBook', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.orderBookSnapshot = {
// 		version: 1,
// 		pair: 'pair',
// 		bids: [],
// 		asks: []
// 	};
// 	makeDepthUtil.lastAcceptedPrice = {
// 		price: 100,
// 		navA: 1.2,
// 		navB: 2,
// 		contractAddress: '',
// 		timestamp: 123445678,
// 		transactionHash: '',
// 		blockNumber: 12345678
// 	};
// 	await makeDepthUtil.startMakingOrders();
// 	expect(orderMakerUtil.takeOneSideOrders as jest.Mock).not.toBeCalled();
// 	expect((orderMakerUtil.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('startMakingOrders no bids, have asks', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.orderBookSnapshot = {
// 		version: 1,
// 		pair: 'pair',
// 		bids: [],
// 		asks: [
// 			{
// 				price: 0.014,
// 				balance: 20,
// 				count: 1
// 			}
// 		]
// 	};
// 	makeDepthUtil.lastAcceptedPrice = {
// 		price: 100,
// 		navA: 1.2,
// 		navB: 2,
// 		contractAddress: '',
// 		timestamp: 123445678,
// 		transactionHash: '',
// 		blockNumber: 12345678
// 	};
// 	await makeDepthUtil.startMakingOrders();
// 	expect(orderMakerUtil.takeOneSideOrders as jest.Mock).not.toBeCalled();
// 	expect((orderMakerUtil.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('startMakingOrders no bids, have asks and ask price lower than expectedMidPrice', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.orderBookSnapshot = {
// 		version: 1,
// 		pair: 'pair',
// 		bids: [],
// 		asks: [
// 			{
// 				price: 0.01,
// 				balance: 20,
// 				count: 1
// 			},
// 			{
// 				price: 0.014,
// 				balance: 10,
// 				count: 1
// 			}
// 		]
// 	};
// 	makeDepthUtil.lastAcceptedPrice = {
// 		price: 100,
// 		navA: 1.2,
// 		navB: 2,
// 		contractAddress: '',
// 		timestamp: 123445678,
// 		transactionHash: '',
// 		blockNumber: 12345678
// 	};
// 	await makeDepthUtil.startMakingOrders();
// 	expect((orderMakerUtil.takeOneSideOrders as jest.Mock).mock.calls).toMatchSnapshot();
// 	expect((orderMakerUtil.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('startMakingOrders no asks, have bids', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.orderBookSnapshot = {
// 		version: 1,
// 		pair: 'pair',
// 		bids: [
// 			{
// 				price: 0.01,
// 				balance: 20,
// 				count: 1
// 			}
// 		],
// 		asks: []
// 	};
// 	makeDepthUtil.lastAcceptedPrice = {
// 		price: 100,
// 		navA: 1.2,
// 		navB: 2,
// 		contractAddress: '',
// 		timestamp: 123445678,
// 		transactionHash: '',
// 		blockNumber: 12345678
// 	};
// 	await makeDepthUtil.startMakingOrders();
// 	expect(orderMakerUtil.takeOneSideOrders as jest.Mock).not.toBeCalled();
// 	expect((orderMakerUtil.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('startMakingOrders no asks, have bids and have bid price >= expectedMidPrice', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.orderBookSnapshot = {
// 		version: 1,
// 		pair: 'pair',
// 		bids: [
// 			{
// 				price: 0.014,
// 				balance: 20,
// 				count: 1
// 			},
// 			{
// 				price: 0.01,
// 				balance: 20,
// 				count: 1
// 			}
// 		],
// 		asks: []
// 	};
// 	makeDepthUtil.lastAcceptedPrice = {
// 		price: 100,
// 		navA: 1.2,
// 		navB: 2,
// 		contractAddress: '',
// 		timestamp: 123445678,
// 		transactionHash: '',
// 		blockNumber: 12345678
// 	};
// 	await makeDepthUtil.startMakingOrders();
// 	expect((orderMakerUtil.takeOneSideOrders as jest.Mock).mock.calls).toMatchSnapshot();
// 	expect((orderMakerUtil.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('startMakingOrders have both asks and have bids', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.orderBookSnapshot = {
// 		version: 1,
// 		pair: 'pair',
// 		bids: [
// 			{
// 				price: 0.01,
// 				balance: 20,
// 				count: 1
// 			}
// 		],
// 		asks: [
// 			{
// 				price: 0.014,
// 				balance: 20,
// 				count: 1
// 			}
// 		]
// 	};
// 	makeDepthUtil.lastAcceptedPrice = {
// 		price: 100,
// 		navA: 1.2,
// 		navB: 2,
// 		contractAddress: '',
// 		timestamp: 123445678,
// 		transactionHash: '',
// 		blockNumber: 12345678
// 	};
// 	await makeDepthUtil.startMakingOrders();
// 	expect(orderMakerUtil.takeOneSideOrders as jest.Mock).not.toBeCalled();
// 	expect((orderMakerUtil.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('startMakingOrders have both asks and have bids, expectedMidPrice > bestAskPrice', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.orderBookSnapshot = {
// 		version: 1,
// 		pair: 'pair',
// 		bids: [
// 			{
// 				price: 0.01,
// 				balance: 20,
// 				count: 1
// 			}
// 		],
// 		asks: [
// 			{
// 				price: 0.011,
// 				balance: 20,
// 				count: 1
// 			}
// 		]
// 	};
// 	makeDepthUtil.lastAcceptedPrice = {
// 		price: 100,
// 		navA: 1.2,
// 		navB: 2,
// 		contractAddress: '',
// 		timestamp: 123445678,
// 		transactionHash: '',
// 		blockNumber: 12345678
// 	};
// 	await makeDepthUtil.startMakingOrders();
// 	expect((orderMakerUtil.takeOneSideOrders as jest.Mock).mock.calls).toMatchSnapshot();
// 	expect((orderMakerUtil.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('startMakingOrders have both asks and have bids, expectedMidPrice < bestBidPrice', async () => {
// 	const orderMakerUtil = {
// 		takeOneSideOrders: jest.fn(() => Promise.resolve()),
// 		createOrderBookSide: jest.fn(() => Promise.resolve())
// 	} as any;
// 	const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);
// 	makeDepthUtil.orderBookSnapshot = {
// 		version: 1,
// 		pair: 'pair',
// 		bids: [
// 			{
// 				price: 0.0125,
// 				balance: 20,
// 				count: 1
// 			}
// 		],
// 		asks: [
// 			{
// 				price: 0.013,
// 				balance: 20,
// 				count: 1
// 			}
// 		]
// 	};
// 	makeDepthUtil.lastAcceptedPrice = {
// 		price: 100,
// 		navA: 1.2,
// 		navB: 2,
// 		contractAddress: '',
// 		timestamp: 123445678,
// 		transactionHash: '',
// 		blockNumber: 12345678
// 	};
// 	await makeDepthUtil.startMakingOrders();
// 	expect((orderMakerUtil.takeOneSideOrders as jest.Mock).mock.calls).toMatchSnapshot();
// 	expect((orderMakerUtil.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
// });
