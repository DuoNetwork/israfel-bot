import {  BEETHOVEN, MOZART, TENOR_M19, TENOR_PPT } from '../../../duo-admin/src/common/constants';
export * from '../../../duo-admin/src/common/constants';
export {
	WS_UNSUB,
	DB_ORDERS,
	WS_INFO,
	DB_ORDER_BOOKS,
	WS_OK,
	DB_SNAPSHOT,
	WS_SUB,
	RELAYER_ADDR_KOVAN,
	RELAYER_ADDR_MAIN,
	DB_ADD,
	TOKEN_WETH,
	ONE_MINUTE_MS
} from '../../../israfel-relayer/src/common/constants';
export {
	BEETHOVEN,
	MOZART,
	TENOR_PPT,
	TENOR_M19
} from '../../../duo-contract-wrapper/src/constants';

export const LOG_INFO = 'INFO';
export const LOG_DEBUG = 'DEBUG';
export const LOG_ERROR = 'ERROR';
export const LOG_RANKING: { [level: string]: number } = {
	[LOG_ERROR]: 0,
	[LOG_INFO]: 1,
	[LOG_DEBUG]: 2
};

export const SRC_INFURA = 'infura';
export const PROVIDER_INFURA_MAIN = 'https://mainnet.infura.io';
export const PROVIDER_INFURA_KOVAN = 'https://kovan.infura.io';
export const MAKE_DEPTH = 'makeDepth';

export const API_BITFINEX = 'bitfinex';
export const API_GEMINI = 'gemini';
export const API_KRAKEN = 'kraken';
export const API_GDAX = 'gdax';

export const SRC = [
	// API_BITFINEX,
	API_GEMINI,
	API_KRAKEN,
	API_GDAX
];

export const MIN_ORDER_BOOK_LEVELS = 3;
export const MIN_SIDE_LIQUIDITY = 50;

export const MIN_ETH_BALANCE = 3;
export const MIN_WETH_BALANCE = 3;
export const MIN_TOKEN_BALANCE = 150;
export const MAX_TOKEN_BALANCE = 400;

export const PRICE_STEP = 0.0005;
export const PRICE_ROUND = 4;
export const PRICE_LEVEL = 5;

export const DB_PRICES_PRIMARY_KEY_RESOLUTION: {
	[period: number]: 'minute' | 'hour' | 'day' | 'month';
} = {
	0: 'minute',
	1: 'hour',
	10: 'hour',
	60: 'day',
	360: 'month',
	1440: 'month'
};

export const AVAILABLE_ADDR_IDX: { [key: string]: number[] } = {
	[BEETHOVEN + '|' + TENOR_PPT]: [0, 1],
	[BEETHOVEN + '|' + TENOR_M19]: [2, 3],
	[MOZART + '|' + TENOR_PPT]: [4, 5],
	[MOZART + '|' + TENOR_M19]: [6, 7]
};
