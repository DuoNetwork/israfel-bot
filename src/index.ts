// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
import dynamoUtil from '../../duo-admin/src/utils/dynamoUtil';
import Web3Wrapper from '../../duo-contract-wrapper/src/Web3Wrapper';
// import israfelDynamoUtil from '../../israfel-relayer/src/utils/dynamoUtil';
import Web3Util from '../../israfel-relayer/src/utils/Web3Util';
import * as CST from './common/constants';
import { IOption } from './common/types';
import { ContractUtil } from './utils/contractUtil';
import { MakeDepthUtil } from './utils/makeDepthUtil';
import { OrderMakerUtil } from './utils/orderMakerUtil';
// import osUtil from './utils/osUtil';
import util from './utils/util';

const tool = process.argv[2];
util.logInfo('tool ' + tool);
const option: IOption = util.parseOptions(process.argv);

if (!option.provider) {
	const infura = require('./keys/infura.json');
	option.source = 'infura';
	option.provider =
		(option.live ? CST.PROVIDER_INFURA_MAIN : CST.PROVIDER_INFURA_KOVAN) + '/' + infura.token;
}

util.logInfo(
	`using ${option.live ? 'live' : 'dev'}
	using source ${option.source}
	using provider ${option.provider}
	for contractType ${option.type}
	for tenor ${option.tenor}
	for token ${option.token}
	for baseToken ${option.baseToken}
	`
);

const web3Wrapper = new Web3Wrapper(null, option.source, option.provider, option.live);

const config = require('./keys/aws/' + (option.live ? 'live' : 'dev') + '/admin.json');
dynamoUtil.init(
	config,
	option.live,
	util.getStatusProcess(tool, option),
	(value: string | number) => web3Wrapper.fromWei(value),
	async txHash => {
		const txReceipt = await web3Wrapper.getTransactionReceipt(txHash);
		if (!txReceipt) return null;
		return {
			status: txReceipt.status
		};
	}
);

const mnemonic = require('./keys/mnemomic.json');
const web3Util = new Web3Util(null, option.live, mnemonic.mnemomic, false);
const contractUtil = new ContractUtil(web3Util, web3Wrapper, option);
const orderMakerUtil: OrderMakerUtil = new OrderMakerUtil(web3Util, contractUtil);
const makeDepthUtil = new MakeDepthUtil(
	option,
	web3Util,
	orderMakerUtil
);
switch (tool) {
	case CST.MAKE_DEPTH:
		makeDepthUtil.startMake(contractUtil, option);
		break;
	default:
		util.logInfo('no such tool ' + tool);
		break;
}
