// import DualClassWrapper from '../../../duo-contract-wrapper/src/DualClassWrapper';
import marketMaker from '../../../israfel-relayer/src/client/marketMaker';
import Web3Util from '../../../israfel-relayer/src/utils/Web3Util';
import * as CST from '../common/constants';
import { IOption } from '../common/types';
// import util from './util';

class AllowanceUtil {
	public async startApproving(web3Util: Web3Util, option: IOption) {
		console.log(`start fauceting approving for ${option.token}`);
		const mnemonic = require('../../../israfel-relayer/src/keys/mnemomicBot.json');
		const accounts = marketMaker.getMakerAccount(mnemonic[option.token], 0);

		if (
			!(await web3Util.getTokenAllowance(CST.TOKEN_WETH, CST.FAUCET_ADDR, accounts.address))
		) {
			console.log(`${accounts.address} ${CST.TOKEN_WETH} allowance is 0, approving`);
			const txHash = await web3Util.setUnlimitedTokenAllowance(
				CST.TOKEN_WETH,
				CST.FAUCET_ADDR,
				accounts.address
			);
			await web3Util.awaitTransactionSuccessAsync(txHash);
		}
		console.log('completed fauceting');
	}
}

const allowanceUtil = new AllowanceUtil();
export default allowanceUtil;
