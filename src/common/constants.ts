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

export const MIN_ETH_BALANCE = 0.5;
export const MIN_WETH_BALANCE = 0.4;
export const MIN_TOKEN_BALANCE = 20;
export const MAX_TOKEN_BALANCE = 100;

export const PRICE_STEP = 0.001;
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
