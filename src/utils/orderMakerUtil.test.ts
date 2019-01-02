// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
test('test', () => {
	expect(true).toBeTruthy()
});

// import Web3Wrapper from '../../../duo-contract-wrapper/src/Web3Wrapper';
// import orderUtil from '../../../israfel-relayer/src/utils/orderUtil';
// import Web3Util from '../../../israfel-relayer/src/utils/Web3Util';
// import { ContractUtil } from './contractUtil';
// import { OrderMakerUtil } from './orderMakerUtil';
// import util from './util';
// const mnemonic = require('../keys/mnemomic.json');

// const web3Util = new Web3Util(null, false, mnemonic.mnemomic, false);
// const option = {
// 	live: false,
// 	source: 'infura',
// 	provider: 'provider',
// 	token: 'token',
// 	type: 'Beethoven',
// 	tenor: 'Perpetual'
// } as any;
// const web3Wrapper = new Web3Wrapper(null, option.source, option.provider, option.live);
// const contractUtil = new ContractUtil(web3Util, web3Wrapper, option);

// test('createDualTokenOrderBook wrong tenor', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
// 	orderMakerUtil.placeOrder = jest.fn(() => Promise.resolve());
// 	util.sleep = jest.fn(() => Promise.resolve());
// 	await orderMakerUtil.createDualTokenOrderBook({
// 		pair: 'pair',
// 		isBid: true,
// 		contractTenor: 'tenor',
// 		midPrice: 120,
// 		totalSize: 50,
// 		numOfOrders: 3,
// 		existingPriceLevel: []
// 	});
// 	expect(util.sleep as jest.Mock).not.toBeCalled();
// 	expect(orderMakerUtil.placeOrder as jest.Mock).not.toBeCalled();
// });

// test('createDualTokenOrderBook', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
// 	orderMakerUtil.placeOrder = jest.fn(() => Promise.resolve(true));
// 	util.sleep = jest.fn(() => Promise.resolve());
// 	Math.random = jest.fn(() => 0.5);
// 	await orderMakerUtil.createDualTokenOrderBook({
// 		pair: 'pair',
// 		isBid: true,
// 		contractTenor: 'M19',
// 		midPrice: 0.0012,
// 		totalSize: 50,
// 		numOfOrders: 3,
// 		existingPriceLevel: []
// 	});
// 	expect((orderMakerUtil.placeOrder as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('takeOneSideOrder', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
// 	orderMakerUtil.placeOrder = jest.fn(() => Promise.resolve(true));
// 	util.sleep = jest.fn(() => Promise.resolve());
// 	await orderMakerUtil.takeOneSideOrders('pair', true, [
// 		{
// 			price: 0.0012,
// 			balance: 20,
// 			count: 10
// 		},
// 		{
// 			price: 0.0011,
// 			balance: 10,
// 			count: 5
// 		}
// 	]);
// 	expect((orderMakerUtil.placeOrder as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('placeOrder, throw error no web3Util', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(null as any, contractUtil);
// 	orderMakerUtil.web3Util = null as any;
// 	try {
// 		await orderMakerUtil.placeOrder(true, 0.0012, 10, 'pair');
// 	} catch (error) {
// 		expect(error).toMatchSnapshot();
// 	}
// });

// test('placeOrder, throw error inValid Pair', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
// 	orderMakerUtil.web3Util.isValidPair = jest.fn(() => false);
// 	try {
// 		await orderMakerUtil.placeOrder(true, 0.0012, 10, 'pair');
// 	} catch (error) {
// 		expect(error).toMatchSnapshot();
// 	}
// });

// test('placeOrder, invalid token', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
// 	orderMakerUtil.web3Util.isValidPair = jest.fn(() => true);
// 	orderMakerUtil.web3Util.getTokenByCode = jest.fn(() => null);
// 	try {
// 		await orderMakerUtil.placeOrder(true, 0.0012, 10, 'aETH|WETH');
// 	} catch (error) {
// 		expect(error).toMatchSnapshot();
// 	}
// });

// test('placeOrder, no takerAssetAmount', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
// 	orderMakerUtil.web3Util.isValidPair = jest.fn(() => true);
// 	orderMakerUtil.web3Util.getTokenByCode = jest.fn(() =>
// 		Object.assign({
// 			custodian: '0xcustodian',
// 			address: '0xaddress',
// 			code: 'code',
// 			denomination: 0.1,
// 			precisions: {
// 				WETH: 0.000005
// 			},
// 			feeSchedules: { WETH: { minimum: 0.1, rate: 0.005 } }
// 		})
// 	);
// 	try {
// 		orderUtil.getAmountAfterFee = jest.fn(() =>
// 			Object.assign({
// 				takerAssetAmount: 0,
// 				makerAssetAmount: 0
// 			})
// 		);
// 		await orderMakerUtil.placeOrder(true, 0.0012, 10, 'aETH|WETH');
// 	} catch (error) {
// 		expect(error).toMatchSnapshot();
// 	}
// });

// test('placeOrder, rawOrder validation error', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
// 	orderMakerUtil.web3Util.isValidPair = jest.fn(() => true);
// 	orderMakerUtil.web3Util.getTokenByCode = jest.fn(() =>
// 		Object.assign({
// 			custodian: '0xcustodian',
// 			address: '0xaddress',
// 			code: 'code',
// 			denomination: 0.1,
// 			precisions: {
// 				WETH: 0.000005
// 			},
// 			feeSchedules: { WETH: { minimum: 0.1, rate: 0.005 } }
// 		})
// 	);
// 	orderMakerUtil.getCurrentAddress = jest.fn(() => 'address');
// 	orderMakerUtil.web3Util.createRawOrder = jest.fn(() =>
// 		Object.assign({
// 			pair: 'pair',
// 			orderHash: 'orderHash',
// 			signedOrder: {
// 				exchangeAddress: 'exchangeAddress',
// 				expirationTimeSeconds: '1234567890',
// 				feeRecipientAddress: 'feeRecipientAddress',
// 				makerAddress: 'makerAddress',
// 				makerAssetAmount: '123',
// 				makerAssetData: 'makerAssetData',
// 				makerFee: '0',
// 				salt: '789',
// 				senderAddress: 'senderAddress',
// 				signature: 'signature',
// 				takerAddress: 'takerAddress',
// 				takerAssetAmount: '456',
// 				takerAssetData: 'takerAssetData',
// 				takerFee: '0'
// 			}
// 		})
// 	);
// 	orderMakerUtil.validateOrder = jest.fn(() => false);
// 	orderUtil.getAmountAfterFee = jest.fn(() =>
// 		Object.assign({
// 			takerAssetAmount: 10,
// 			makerAssetAmount: 10
// 		})
// 	);
// 	try {
// 		await orderMakerUtil.placeOrder(true, 0.0012, 10, 'aETH|WETH');
// 	} catch (error) {
// 		expect(error).toMatchSnapshot();
// 	}
// 	// expect((orderMakerUtil.web3Util.getTokenByCode as jest.Mock).mock.calls).toMatchSnapshot();
// 	// expect((orderMakerUtil.web3Util.createRawOrder as jest.Mock).mock.calls).toMatchSnapshot();
// 	// expect((orderMakerUtil.validateOrder as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('placeOrder, rawOrder validation passed no ws client', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
// 	orderMakerUtil.web3Util.isValidPair = jest.fn(() => true);
// 	orderMakerUtil.ws = null;
// 	orderMakerUtil.web3Util.getTokenByCode = jest.fn(() =>
// 		Object.assign({
// 			custodian: '0xcustodian',
// 			address: '0xaddress',
// 			code: 'code',
// 			denomination: 0.1,
// 			precisions: {
// 				WETH: 0.000005
// 			},
// 			feeSchedules: { WETH: { minimum: 0.1, rate: 0.005 } }
// 		})
// 	);
// 	orderMakerUtil.getCurrentAddress = jest.fn(() => true);
// 	orderMakerUtil.web3Util.createRawOrder = jest.fn(() =>
// 		Object.assign({
// 			pair: 'pair',
// 			orderHash: 'orderHash',
// 			signedOrder: {
// 				exchangeAddress: 'exchangeAddress',
// 				expirationTimeSeconds: '1234567890',
// 				feeRecipientAddress: 'feeRecipientAddress',
// 				makerAddress: 'makerAddress',
// 				makerAssetAmount: '123',
// 				makerAssetData: 'makerAssetData',
// 				makerFee: '0',
// 				salt: '789',
// 				senderAddress: 'senderAddress',
// 				signature: 'signature',
// 				takerAddress: 'takerAddress',
// 				takerAssetAmount: '456',
// 				takerAssetData: 'takerAssetData',
// 				takerFee: '0'
// 			}
// 		})
// 	);
// 	orderMakerUtil.validateOrder = jest.fn(() => 'orderHash');
// 	orderUtil.getAmountAfterFee = jest.fn(() =>
// 		Object.assign({
// 			takerAssetAmount: 10,
// 			makerAssetAmount: 10
// 		})
// 	);
// 	try {
// 		await orderMakerUtil.placeOrder(true, 0.0012, 10, 'aETH|WETH');
// 	} catch (error) {
// 		expect(error).toMatchSnapshot();
// 	}
// 	// expect((orderMakerUtil.web3Util.getTokenByCode as jest.Mock).mock.calls).toMatchSnapshot();
// 	// expect((orderMakerUtil.web3Util.createRawOrder as jest.Mock).mock.calls).toMatchSnapshot();
// 	// expect((orderMakerUtil.validateOrder as jest.Mock).mock.calls).toMatchSnapshot();
// });

// test('placeOrder, success', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
// 	orderMakerUtil.web3Util.isValidPair = jest.fn(() => true);
// 	orderMakerUtil.ws = {
// 		send: jest.fn(() => Promise.resolve())
// 	} as any;
// 	orderMakerUtil.web3Util.getTokenByCode = jest.fn(() =>
// 		Object.assign({
// 			custodian: '0xcustodian',
// 			address: '0xaddress',
// 			code: 'code',
// 			denomination: 0.1,
// 			precisions: {
// 				WETH: 0.000005
// 			},
// 			feeSchedules: { WETH: { minimum: 0.1, rate: 0.005 } }
// 		})
// 	);
// 	orderMakerUtil.getCurrentAddress = jest.fn(() => true);
// 	orderMakerUtil.web3Util.createRawOrder = jest.fn(() =>
// 		Object.assign({
// 			pair: 'pair',
// 			orderHash: 'orderHash',
// 			signedOrder: {
// 				exchangeAddress: 'exchangeAddress',
// 				expirationTimeSeconds: '1234567890',
// 				feeRecipientAddress: 'feeRecipientAddress',
// 				makerAddress: 'makerAddress',
// 				makerAssetAmount: '123',
// 				makerAssetData: 'makerAssetData',
// 				makerFee: '0',
// 				salt: '789',
// 				senderAddress: 'senderAddress',
// 				signature: 'signature',
// 				takerAddress: 'takerAddress',
// 				takerAssetAmount: '456',
// 				takerAssetData: 'takerAssetData',
// 				takerFee: '0'
// 			}
// 		})
// 	);
// 	orderMakerUtil.validateOrder = jest.fn(() => 'orderHash');
// 	orderUtil.getAmountAfterFee = jest.fn(() =>
// 		Object.assign({
// 			takerAssetAmount: 10,
// 			makerAssetAmount: 10
// 		})
// 	);
// 	await orderMakerUtil.placeOrder(true, 0.0012, 10, 'aETH|WETH');
// 	expect(((orderMakerUtil.ws as any).send as jest.Mock).mock.calls).toMatchSnapshot();
// 	expect((orderMakerUtil.web3Util.getTokenByCode as jest.Mock).mock.calls).toMatchSnapshot();
// 	expect((orderMakerUtil.web3Util.createRawOrder as jest.Mock).mock.calls).toMatchSnapshot();
// 	expect((orderMakerUtil.validateOrder as jest.Mock).mock.calls).toMatchSnapshot();
// });
