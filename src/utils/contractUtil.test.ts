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

test('checkBalance, not enought wethBalance', async () => {
	const tokenBalances: { [key: string]: number } = {
		code1: 200,
		code2: 1
	};
	contractUtil.web3Util.getGasPrice = jest.fn(() => 1000000000);
	contractUtil.web3Util.getTransactionCount = jest.fn(() => 10);
	contractUtil.web3Util.getEthBalance = jest.fn(() => 100);
	contractUtil.web3Util.getTokenBalance = jest.fn(code => tokenBalances[code]);
	contractUtil.web3Util.getProxyTokenAllowance = jest.fn(() => 100000);
	contractUtil.web3Util.wrapEther = jest.fn(() => Promise.resolve());
	contractUtil.web3Wrapper.ethTransferRaw = jest.fn(() => Promise.resolve());
	await contractUtil.checkBalance('code1|code2', 0, ['address0']);
	expect(contractUtil.web3Wrapper.ethTransferRaw as jest.Mock).not.toBeCalled();
	expect((contractUtil.web3Util.wrapEther as jest.Mock).mock.calls).toMatchSnapshot();
});

test('checkBalance, not enought wethBalance and not enough ethBalance', async () => {
	const tokenBalances: { [key: string]: number } = {
		code1: 200,
		code2: 0
	};
	contractUtil.web3Util.getGasPrice = jest.fn(() => 1000000000);
	contractUtil.web3Util.getTransactionCount = jest.fn(() => 10);
	contractUtil.web3Util.getEthBalance = jest.fn(() => CST.MIN_ETH_BALANCE);
	contractUtil.web3Util.getTokenBalance = jest.fn(code => tokenBalances[code]);
	contractUtil.web3Util.getProxyTokenAllowance = jest.fn(() => 100000);
	contractUtil.web3Util.wrapEther = jest.fn(() => Promise.resolve());
	contractUtil.web3Wrapper.ethTransferRaw = jest.fn(() => Promise.resolve());
	await contractUtil.checkBalance('code1|code2', 0, ['address0']);
	expect((contractUtil.web3Wrapper.ethTransferRaw as jest.Mock).mock.calls).toMatchSnapshot();
	expect((contractUtil.web3Util.wrapEther as jest.Mock).mock.calls).toMatchSnapshot();
});

test('checkBalance, not enought wethAllowance', async () => {
	const tokenBalances: { [key: string]: number } = {
		code1: 200,
		code2: 4
	};
	const tokenAllowance: { [key: string]: number } = {
		code1: 200,
		code2: 0
	};
	contractUtil.web3Util.getGasPrice = jest.fn(() => 1000000000);
	contractUtil.web3Util.getTransactionCount = jest.fn(() => 10);
	contractUtil.web3Util.getEthBalance = jest.fn(() => CST.MIN_ETH_BALANCE);
	contractUtil.web3Util.getTokenBalance = jest.fn(code => tokenBalances[code]);
	contractUtil.web3Util.getProxyTokenAllowance = jest.fn(code => tokenAllowance[code]);
	contractUtil.web3Util.wrapEther = jest.fn(() => Promise.resolve());
	contractUtil.web3Util.setUnlimitedTokenAllowance = jest.fn(() => Promise.resolve());

	contractUtil.web3Wrapper.ethTransferRaw = jest.fn(() => Promise.resolve());
	await contractUtil.checkBalance('code1|code2', 0, ['address0']);
	expect(
		(contractUtil.web3Util.setUnlimitedTokenAllowance as jest.Mock).mock.calls
	).toMatchSnapshot();
});

test('checkBalance, not enought tokenBalance', async () => {
	const tokenBalances: { [key: string]: number } = {
		code1: 100,
		code2: 4
	};
	const tokenAllowance: { [key: string]: number } = {
		code1: 200,
		code2: 100
	};

	contractUtil.estimateDualTokenCreateAmt = jest.fn(() => Promise.resolve([200, 200]));
	contractUtil.web3Util.getGasPrice = jest.fn(() => 1000000000);
	contractUtil.web3Util.getTransactionCount = jest.fn(() => 10);
	contractUtil.web3Util.getEthBalance = jest.fn(() => CST.MIN_ETH_BALANCE);
	contractUtil.web3Util.getTokenBalance = jest.fn(code => tokenBalances[code]);
	contractUtil.web3Util.getProxyTokenAllowance = jest.fn(code => tokenAllowance[code]);
	contractUtil.web3Util.wrapEther = jest.fn(() => Promise.resolve());
	contractUtil.web3Util.setUnlimitedTokenAllowance = jest.fn(() => Promise.resolve());
	contractUtil.dualClassCustodianWrapper.createRaw = jest.fn(() => Promise.resolve());
	contractUtil.web3Wrapper.ethTransferRaw = jest.fn(() => Promise.resolve());
	await contractUtil.checkBalance('code1|code2', 0, [
		'0x3d00299fbf830c43bb9523d44bdeb0afa874658c'
	]);
	expect(
		(contractUtil.dualClassCustodianWrapper.createRaw as jest.Mock).mock.calls
	).toMatchSnapshot();
});

test('checkBalance, not enought tokenBalance & need transferEth', async () => {
	const tokenBalances: { [key: string]: number } = {
		code1: 100,
		code2: 4
	};
	const tokenAllowance: { [key: string]: number } = {
		code1: 200,
		code2: 100
	};

	contractUtil.estimateDualTokenCreateAmt = jest.fn(() => Promise.resolve([0, 0]));
	contractUtil.web3Util.getGasPrice = jest.fn(() => 1000000000);
	contractUtil.web3Util.getTransactionCount = jest.fn(() => 10);
	contractUtil.web3Util.getEthBalance = jest.fn(() => CST.MIN_ETH_BALANCE);
	contractUtil.web3Util.getTokenBalance = jest.fn(code => tokenBalances[code]);
	contractUtil.web3Util.getProxyTokenAllowance = jest.fn(code => tokenAllowance[code]);
	contractUtil.web3Util.wrapEther = jest.fn(() => Promise.resolve());
	contractUtil.web3Util.setUnlimitedTokenAllowance = jest.fn(() => Promise.resolve());
	contractUtil.dualClassCustodianWrapper.createRaw = jest.fn(() => Promise.resolve());
	contractUtil.web3Wrapper.ethTransferRaw = jest.fn(() => Promise.resolve());
	await contractUtil.checkBalance('code1|code2', 0, [
		'0x3d00299fbf830c43bb9523d44bdeb0afa874658c'
	]);

	expect((contractUtil.web3Wrapper.ethTransferRaw as jest.Mock).mock.calls).toMatchSnapshot();

	expect(
		(contractUtil.dualClassCustodianWrapper.createRaw as jest.Mock).mock.calls
	).toMatchSnapshot();
});

test('checkBalance, too much tokenBalance,need redeem', async () => {
	const tokenBalances: { [key: string]: number } = {
		code1: 600,
		code2: 4
	};
	const tokenAllowance: { [key: string]: number } = {
		code1: 200,
		code2: 100
	};

	contractUtil.estimateDualTokenCreateAmt = jest.fn(() => Promise.resolve([200, 200]));
	contractUtil.web3Util.getGasPrice = jest.fn(() => 1000000000);
	contractUtil.web3Util.getTransactionCount = jest.fn(() => 10);
	contractUtil.web3Util.getEthBalance = jest.fn(() => CST.MIN_ETH_BALANCE);
	contractUtil.web3Util.getTokenBalance = jest.fn(code => tokenBalances[code]);
	contractUtil.web3Util.getProxyTokenAllowance = jest.fn(code => tokenAllowance[code]);
	contractUtil.web3Util.wrapEther = jest.fn(() => Promise.resolve());
	contractUtil.web3Util.setUnlimitedTokenAllowance = jest.fn(() => Promise.resolve());
	contractUtil.dualClassCustodianWrapper.redeemRaw = jest.fn(() => Promise.resolve());
	contractUtil.dualClassCustodianWrapper.getStates = jest.fn(() =>
		Promise.resolve({
			alpha: 1
		})
	);
	contractUtil.web3Wrapper.ethTransferRaw = jest.fn(() => Promise.resolve());
	await contractUtil.checkBalance('code1|code2', 0, [
		'0x3d00299fbf830c43bb9523d44bdeb0afa874658c'
	]);
	expect(
		(contractUtil.dualClassCustodianWrapper.redeemRaw as jest.Mock).mock.calls
	).toMatchSnapshot();
});

test('checkBalance, not enought tokenAllowance', async () => {
	const tokenBalances: { [key: string]: number } = {
		code1: 100,
		code2: 4
	};
	const tokenAllowance: { [key: string]: number } = {
		code1: 0,
		code2: 100
	};

	contractUtil.estimateDualTokenCreateAmt = jest.fn(() => Promise.resolve([200, 200]));
	contractUtil.web3Util.getGasPrice = jest.fn(() => 1000000000);
	contractUtil.web3Util.getTransactionCount = jest.fn(() => 10);
	contractUtil.web3Util.getEthBalance = jest.fn(() => CST.MIN_ETH_BALANCE);
	contractUtil.web3Util.getTokenBalance = jest.fn(code => tokenBalances[code]);
	contractUtil.web3Util.getProxyTokenAllowance = jest.fn(code => tokenAllowance[code]);
	contractUtil.web3Util.wrapEther = jest.fn(() => Promise.resolve());
	contractUtil.web3Util.setUnlimitedTokenAllowance = jest.fn(() => Promise.resolve());
	contractUtil.dualClassCustodianWrapper.redeemRaw = jest.fn(() => Promise.resolve());
	contractUtil.dualClassCustodianWrapper.getStates = jest.fn(() =>
		Promise.resolve({
			alpha: 1
		})
	);
	contractUtil.web3Wrapper.ethTransferRaw = jest.fn(() => Promise.resolve());
	await contractUtil.checkBalance('code1|code2', 0, [
		'0x3d00299fbf830c43bb9523d44bdeb0afa874658c'
	]);
	expect(
		(contractUtil.web3Util.setUnlimitedTokenAllowance as jest.Mock).mock.calls
	).toMatchSnapshot();
});

test('checkBalance, estimateDualTokenCreateAmt', async () => {
	contractUtil.dualClassCustodianWrapper.getStates = jest.fn(() =>
		Object.assign({
			lastOperationTime: 0,
			operationCoolDown: 0,
			state: 'trading',
			minBalance: 0,
			totalSupplyA: 0,
			totalSupplyB: 0,
			ethCollateral: 0,
			navA: 0,
			navB: 0,
			lastPrice: 0,
			lastPriceTime: 0,
			resetPrice: 100,
			resetPriceTime: 0,
			createCommRate: 0.01,
			redeemCommRate: 0,
			period: 60,
			maturity: 0,
			preResetWaitingBlocks: 1,
			priceFetchCoolDown: 1,
			nextResetAddrIndex: 1,
			totalUsers: 1,
			feeBalance: 1,
			resetState: 2,
			alpha: 1,
			beta: 1,
			periodCoupon: 60,
			limitPeriodic: 60,
			limitUpper: 1,
			limitLower: 1,
			iterationGasThreshold: 1
		})
	);

	const res = await contractUtil.estimateDualTokenCreateAmt(1);
	expect(res).toMatchSnapshot();
});
