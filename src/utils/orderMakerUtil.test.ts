// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
import Web3Wrapper from '../../../duo-contract-wrapper/src/Web3Wrapper';
import Web3Util from '../../../israfel-relayer/src/utils/Web3Util';
import { ContractUtil } from './contractUtil';
import { OrderMakerUtil } from './orderMakerUtil';
import util from './util';
const mnemonic = require('../keys/mnemomic.json');

const web3Util = new Web3Util(null, false, mnemonic.mnemomic, false);
const option = {
	live: false,
	source: 'infura',
	provider: 'provider',
	token: 'token',
	type: 'Beethoven',
	tenor: 'Perpetual'
} as any;
const web3Wrapper = new Web3Wrapper(null, option.source, option.provider, option.live);
const contractUtil = new ContractUtil(web3Util, web3Wrapper, option);

test('createDualTokenOrderBook wrong tenor', async () => {
	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
	orderMakerUtil.placeOrder = jest.fn(() => Promise.resolve());
	util.sleep = jest.fn(() => Promise.resolve());
	await orderMakerUtil.createDualTokenOrderBook({
		pair: 'pair',
		isBid: true,
		contractTenor: 'tenor',
		midPrice: 120,
		totalSize: 50,
		numOfOrders: 3,
		existingPriceLevel: []
	});
	expect(util.sleep as jest.Mock).not.toBeCalled();
	expect(orderMakerUtil.placeOrder as jest.Mock).not.toBeCalled();
});

test('createDualTokenOrderBook', async () => {
	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
	orderMakerUtil.placeOrder = jest.fn(() => Promise.resolve(true));
	util.sleep = jest.fn(() => Promise.resolve());
	await orderMakerUtil.createDualTokenOrderBook({
		pair: 'pair',
		isBid: true,
		contractTenor: 'M19',
		midPrice: 0.0012,
		totalSize: 50,
		numOfOrders: 3,
		existingPriceLevel: []
	});
	expect((orderMakerUtil.placeOrder as jest.Mock).mock.calls).toMatchSnapshot();
});

test('takeOneSideOrder', async () => {
	const orderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
	orderMakerUtil.placeOrder = jest.fn(() => Promise.resolve(true));
	util.sleep = jest.fn(() => Promise.resolve());
	await orderMakerUtil.takeOneSideOrders('pair', true, [
		{
			price: 0.0012,
			balance: 20,
			count: 10
		},
		{
			price: 0.0011,
			balance: 10,
			count: 5
		}
	]);
	expect((orderMakerUtil.placeOrder as jest.Mock).mock.calls).toMatchSnapshot();
});

// test('placeOrder', async () => {
// 	const orderMakerUtil = new OrderMakerUtil(null as any, contractUtil);
// 	orderMakerUtil.web3Util = null as any;
// 	expect(() => orderMakerUtil.placeOrder(true, 0.0012, 10, 'pair')).toThrowError();
// });
