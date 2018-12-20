import moment from 'moment';
import Web3 from 'web3';
import DualClassWrapper from '../../../duo-contract-wrapper/src/DualClassWrapper';
import Web3Wrapper from '../../../duo-contract-wrapper/src/Web3Wrapper';
import Web3Util from '../../../israfel-relayer/src/utils/Web3Util';
import * as CST from '../common/constants';
import { IAccounts, IDualClassStates, IOption } from '../common/types';
import priceUtil from './priceUtil';
import util from './util';

const Tx = require('ethereumjs-tx');

export class ContractUtil {
	public dualClassCustodianWrapper: DualClassWrapper;
	public web3Wrapper: Web3Wrapper | null = null;
	public web3Util: Web3Util;
	public web3: Web3;

	constructor(web3Util: Web3Util, web3Wrapper: Web3Wrapper, option: IOption) {
		this.web3Wrapper = web3Wrapper;
		this.web3Util = web3Util;
		this.dualClassCustodianWrapper = new DualClassWrapper(
			web3Wrapper,
			web3Wrapper.contractAddresses.Custodians.Beethoven[option.tenor].custodian.address
		);
		this.web3 = new Web3(
			option.source
				? new Web3.providers.HttpProvider(option.provider)
				: new Web3.providers.WebsocketProvider(option.provider)
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

	private getMainAccount(): IAccounts {
		const faucetAccount = require('../keys/faucetAccount.json');

		return {
			address: faucetAccount.publicKey,
			privateKey: faucetAccount.privateKey
		};
	}

	private async ethTransferRaw(
		web3: Web3,
		from: string,
		privatekey: string,
		to: string,
		amt: number,
		nonce: number
	) {
		const rawTx = {
			nonce: nonce,
			gasPrice: web3.utils.toHex((await web3.eth.getGasPrice()) || CST.DEFAULT_GAS_PRICE),
			gasLimit: web3.utils.toHex(23000),
			from: from,
			to: to,
			value: web3.utils.toHex(web3.utils.toWei(amt.toPrecision(3) + '', 'ether'))
		};
		return web3.eth
			.sendSignedTransaction('0x' + this.signTx(rawTx, privatekey))
			.then(receipt => util.logInfo(JSON.stringify(receipt, null, 4)));
	}

	public signTx(rawTx: object, privateKey: string): string {
		try {
			const tx = new Tx(rawTx);
			tx.sign(new Buffer(privateKey, 'hex'));
			return tx.serialize().toString('hex');
		} catch (err) {
			util.logError(err);
			return '';
		}
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
						`the address ${address} current eth balance is ${ethBalance}, make transfer...`
					);
					addresses = addresses.filter(addr => addr !== address);
					const faucetAccount: IAccounts = this.getMainAccount();

					await this.ethTransferRaw(
						this.web3,
						faucetAccount.address,
						faucetAccount.privateKey,
						address,
						CST.MIN_ETH_BALANCE,
						await this.web3Util.getTransactionCount(faucetAccount.address)
					);
					continue;
				}

				// wEthBalance
				const wEthBalance = await this.web3Util.getTokenBalance(code2, address);
				if (wEthBalance < CST.MIN_WETH_BALANCE) {
					util.logInfo(
						`the address ${address} current weth balance is ${wEthBalance}, wrapping...`
					);
					const amtToWrap = CST.MIN_WETH_BALANCE + 0.1 - wEthBalance;
					if (ethBalance > amtToWrap) {
						util.logInfo(`start wrapping for ${address} with amt ${amtToWrap}`);
						await this.web3Util.wrapEther(amtToWrap, address);
					} else {
						util.logInfo(
							`the address ${address} current weth balance is ${wEthBalance}, not enought eth to wrapping, skip...`
						);
						addresses = addresses.filter(addr => addr !== address);
						continue;
					}
				}

				// tokenBalance
				const tokenBalance = await this.web3Util.getTokenBalance(code1, address);
				util.logInfo(`the ${code1} tokenBalance of ${address} is ${tokenBalance}`);
				const accountsBot: IAccounts[] = require('../keys/accountsBot.json');
				const account = accountsBot.find(a => a.address === address);
				const gasPrice = Math.max(
					await this.web3Util.getGasPrice(),
					CST.DEFAULT_GAS_PRICE * Math.pow(10, 9)
				);
				if (tokenBalance < CST.MIN_TOKEN_BALANCE) {
					util.logInfo(
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
						if (account)
							await this.dualClassCustodianWrapper.createRaw(
								address,
								account.privateKey,
								gasPrice,
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
				} else if (tokenBalance >= CST.MAX_TOKEN_BALANCE) {
					util.logDebug(
						`the address ${address} current token balance of ${code1} is ${tokenBalance}, need redeem back...`
					);
					if (account) {
						const states: IDualClassStates = await this.dualClassCustodianWrapper.getStates();
						await this.dualClassCustodianWrapper.redeemRaw(
							address,
							account.privateKey,
							tokenBalance - CST.MAX_TOKEN_BALANCE,
							(tokenBalance - CST.MAX_TOKEN_BALANCE) / states.alpha,
							gasPrice,
							CST.REDEEM_GAS
						);
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
