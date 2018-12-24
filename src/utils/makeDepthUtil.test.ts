// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
// import { IAcceptedPrice, IOrderBookSnapshot } from '../common/types';
import { MakeDepthUtil } from './makeDepthUtil';

const option = {
	token: 'token',
	type: 'type',
	tenor: 'tenor'
} as any;

const web3Util = {} as any;
const orderMakerUtil = {
	takeOneSideOrders: jest.fn(() => Promise.resolve()),
	createOrderBookSide: jest.fn(() => Promise.resolve())
} as any;

const makeDepthUtil = new MakeDepthUtil(option, web3Util, orderMakerUtil);

test('startMakingOrders no orderBookSnapshot', async () => {
	makeDepthUtil.orderBookSnapshot = null;
	await makeDepthUtil.startMakingOrders();
	expect(orderMakerUtil.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(orderMakerUtil.createOrderBookSide as jest.Mock).not.toBeCalled();
});

test('startMakingOrders no lastAcceptedPrice', async () => {
	makeDepthUtil.lastAcceptedPrice = null;
	await makeDepthUtil.startMakingOrders();
	expect(orderMakerUtil.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect(orderMakerUtil.createOrderBookSide as jest.Mock).not.toBeCalled();
});

test('startMakingOrders no orderBook', async () => {
	makeDepthUtil.orderBookSnapshot = {
		version: 1,
		pair: 'pair',
		bids: [],
		asks: []
	};
	makeDepthUtil.lastAcceptedPrice = {
		price: 100,
		navA: 1.2,
		navB: 2,
		contractAddress: '',
		timestamp: 123445678,
		transactionHash: '',
		blockNumber: 12345678
	};
	await makeDepthUtil.startMakingOrders();
	expect(orderMakerUtil.takeOneSideOrders as jest.Mock).not.toBeCalled();
	expect((orderMakerUtil.createOrderBookSide as jest.Mock).mock.calls).toMatchSnapshot();
});
