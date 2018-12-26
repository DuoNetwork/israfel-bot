// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
import Web3Wrapper from '../../../duo-contract-wrapper/src/Web3Wrapper';
import Web3Util from '../../../israfel-relayer/src/utils/Web3Util';
import * as CST from '../common/constants';
import { ContractUtil } from './contractUtil';
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

test('checkBalance, not enought ethBalance', async () => {
	contractUtil.web3Util.getEthBalance = jest.fn(() => CST.MIN_ETH_BALANCE - 0.2);

	contractUtil.web3Util.getTokenBalance = jest.fn(() => 200);
	contractUtil.web3Util.getProxyTokenAllowance = jest.fn(() => 100000);
	contractUtil.web3Util.getGasPrice = jest.fn(() => 1000000000);

	contractUtil.web3Util.getTransactionCount = jest.fn(() => 10);
	contractUtil.web3Wrapper.ethTransferRaw = jest.fn(() => Promise.resolve());
	await contractUtil.checkBalance('pair', 0, ['address0']);
	expect((contractUtil.web3Wrapper.ethTransferRaw as jest.Mock).mock.calls).toMatchSnapshot();
});
