// fix for @ledgerhq/hw-transport-u2f 4.28.0
import '@babel/polyfill';
import { Constants } from '@finbook/israfel-common';
import { IOption } from './common/types';
import marketMaker from './marketMaker/dualMarketMaker';
import vvdMarketMaker from './marketMaker/vvdMarketMaker';
import dynamoUtil from './utils/dynamoUtil';
import osUtil from './utils/osUtil';
import serverMasterUtil from './utils/serverMasterUtil';
import util from './utils/util';

const tool = process.argv[2];
const option: IOption = util.parseOptions(process.argv);
util.logInfo(`tool ${tool} using env ${option.env}`);
if (option.debug) util.logLevel = Constants.LOG_DEBUG;

const config = require(`./keys/israfel.admin.${option.env}.json`);
dynamoUtil.init(config, option.env, tool, osUtil.getHostName());

switch (tool) {
	case Constants.DB_MKT_MAKER:
		serverMasterUtil.startLaunching(tool, option, opt => marketMaker.startProcessing(opt));
		break;
	case 'vvd':
		vvdMarketMaker.start();
		break;
	default:
		break;
}
