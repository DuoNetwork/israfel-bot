// import moment from 'moment';
// import calculator from '../../../duo-admin/src/utils/calculator';
// import dynamoUtil from '../../../duo-admin/src/utils/dynamoUtil';
// import * as CST from '../common/constants';
// import { IOption, ITrade } from '../common/types';
// import util from './util';

// class PriceUtil {
// 	public async getLastPrice(length: number, option: IOption): Promise<number> {
// 		const now = moment.utc();
// 		const current = util.getUTCNowTimestamp();
// 		const EXCHANGES_TRADES: { [key: string]: ITrade[] } = {
// 			// [CST.API_BITFINEX]: [],
// 			[CST.API_GEMINI]: [],
// 			[CST.API_GDAX]: [],
// 			[CST.API_KRAKEN]: []
// 		};
// 		const minutesToQuery: string[] = [];
// 		for (let i = 0; i < length; i++) {
// 			const currentTime = now.subtract(1, 'minutes').format('YYYY-MM-DD-HH-mm');
// 			minutesToQuery.push(currentTime);
// 		}
// 		for (const src of CST.SRC)
// 			for (const dateHourMinute of minutesToQuery) {
// 				const trades = await dynamoUtil.getTrades(
// 					src,
// 					dateHourMinute,
// 					option.baseToken + '|' + 'USD'
// 				);
// 				trades.map(trade => EXCHANGES_TRADES[src].push(trade));
// 			}

// 		const exchangePriceVolume = CST.API_LIST.map(src =>
// 			calculator.getExchangePriceFix(EXCHANGES_TRADES[src], current)
// 		);
// 		const priceFix: number = calculator.consolidatePriceFix(exchangePriceVolume);
// 		return priceFix;
// 	}
// }

// const priceUtil = new PriceUtil();

// export default priceUtil;
