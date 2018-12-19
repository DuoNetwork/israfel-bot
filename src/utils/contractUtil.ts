import moment from 'moment';
import DualClassWrapper from '../../../duo-contract-wrapper/src/DualClassWrapper';
import Web3Wrapper from '../../../duo-contract-wrapper/src/Web3Wrapper';
import Web3Util from '../../../israfel-relayer/src/utils/Web3Util';
import * as CST from '../common/constants';
import { IAccounts, IDualClassStates, IOption } from '../common/types';
import priceUtil from './priceUtil';
import util from './util';

export class ContractUtil {
	public dualClassCustodianWrapper: DualClassWrapper;
	public web3Wrapper: Web3Wrapper | null = null;
	public web3Util: Web3Util;

	constructor(web3Util: Web3Util, web3Wrapper: Web3Wrapper, option: IOption) {
		this.web3Wrapper = web3Wrapper;
		this.web3Util = web3Util;
		this.dualClassCustodianWrapper = new DualClassWrapper(
			web3Wrapper,
			web3Wrapper.contractAddresses.Custodians.Beethoven[option.tenor].custodian.address
		);
	}

	public async estimateBeethovenPrice(option: IOption): Promise<number[]> {
		if (!this.dualClassCustodianWrapper) {
			util.logDebug(`no dualClassWrapper initiated`);
			return [];
		}

		const states: IDualClassStates = await this.dualClassCustodianWrapper.getStates();

		const price = await priceUtil.getLastPrice(15, option);

		if (!price) {
			util.logDebug(`no price calculated`);
			return [];
		}

		const resetTime = Math.floor(states.resetPriceTime / 1000);
		const { resetPrice, beta, alpha, periodCoupon } = states;

		const time = Math.floor(moment.utc().valueOf() / 1000);

		const numOfPeriods = Math.floor((time - resetTime) / (states.period / 1000));
		const navParent = (price / resetPrice / beta) * (1 + alpha);

		const navA = 1 + numOfPeriods * Number(periodCoupon);
		const navAAdj = navA * alpha;
		if (navParent <= navAAdj) return [navParent / alpha, 0];
		else return [navA / price, navParent - navAAdj / price];
	}

	public async estimateBeethovenTokenCreateAmt(ethAmount: number): Promise<number[]> {
		if (!this.dualClassCustodianWrapper || ethAmount <= 0) {
			util.logDebug(`no dualClassWrapper initiated`);
			return [];
		}

		const states: IDualClassStates = await this.dualClassCustodianWrapper.getStates();

		const tokenValueB =
			(((1 - states.createCommRate) * states.resetPrice) / (1 + states.alpha)) * ethAmount;
		const tokenValueA = states.alpha * tokenValueB;
		return [tokenValueA, tokenValueB];
	}

	public async createRaw(
		address: string,
		privateKey: string,
		gasPrice: number,
		gasLimit: number,
		eth: number
	) {
		return this.dualClassCustodianWrapper.createRaw(
			address,
			privateKey,
			gasPrice,
			gasLimit,
			eth
		);
	}

	public async checkBalance(
		pair: string,
		tokenIndex: number,
		addresses: string[]
	): Promise<string[]> {
		const [code1, code2] = pair.split('|');

		for (const address of addresses)
			if (this.web3Util) {
				// ethBalance
				const ethBalance = await this.web3Util.getEthBalance(address);
				util.logInfo(`the ethBalance of ${address} is ${ethBalance}`);
				if (ethBalance < CST.MIN_ETH_BALANCE) {
					util.logDebug(
						`the address ${address} current eth balance is ${ethBalance}, skip...`
					);
					addresses = addresses.filter(addr => addr !== address);
					continue;
				}

				// wEthBalance
				const wEthBalance = await this.web3Util.getTokenBalance(code2, address);
				if (
					wEthBalance < CST.MIN_WETH_BALANCE &&
					ethBalance + wEthBalance > CST.MIN_ETH_BALANCE + CST.MIN_WETH_BALANCE + 0.1
				) {
					util.logDebug(
						`the address ${address} current weth balance is ${wEthBalance}, wrapping...`
					);
					await this.web3Util.wrapEther(
						CST.MIN_WETH_BALANCE + 0.1 - wEthBalance,
						address
					);
				} else {
					util.logDebug(
						`the address ${address} current weth balance is ${wEthBalance}, not enought eth to wrapping, skip...`
					);
					addresses = addresses.filter(addr => addr !== address);
					continue;
				}

				// tokenBalance
				const tokenBalance = await this.web3Util.getTokenBalance(code1, address);
				if (tokenBalance < CST.MIN_TOKEN_BALANCE) {
					util.logDebug(
						`the address ${address} current token balance of ${code1} is ${tokenBalance}, need create more tokens...`
					);

					const tokenValues = await this.estimateBeethovenTokenCreateAmt(
						ethBalance - CST.MIN_ETH_BALANCE - 0.1
					);
					if (
						tokenValues.length &&
						tokenValues[tokenIndex] + tokenBalance > CST.MIN_TOKEN_BALANCE
					) {
						util.logDebug(`creating token ${code1}`);
						const accountsBot: IAccounts[] = require('../keys/accountsBot.json');
						const account = accountsBot.find(a => a.address === address);
						console.log(
							Number(
								Number(
									(ethBalance - CST.MIN_ETH_BALANCE - 0.1).toFixed(10)
								).toPrecision(3)
							)
						);
						if (account)
							await this.createRaw(
								address,
								account.privateKey,
								Math.max(
									await this.web3Util.getGasPrice(),
									CST.DEFAULT_GAS_PRICE * Math.pow(10, 9)
								),
								CST.CREATE_GAS,
								Number(
									Number(
										(ethBalance - CST.MIN_ETH_BALANCE - 0.1).toFixed(10)
									).toPrecision(3)
								)
							);
						else {
							util.logDebug(`the address ${address} cannot create, skip...`);
							addresses = addresses.filter(addr => addr !== address);
							continue;
						}
					}
				}

				// tokenAllowance
				const tokenAllowance = await this.web3Util.getProxyTokenAllowance(code1, address);
				if (tokenAllowance <= 0) {
					util.logDebug(`the address ${address} token allowance is 0, approvaing.....`);
					this.web3Util.setUnlimitedTokenAllowance(code1, address);
				}
			}

		return addresses;
	}
}
