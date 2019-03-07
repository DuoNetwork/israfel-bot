export const AWS_DYNAMO_API_VERSION = '2012-10-08';
export const TAKER_ETH_DEPOSIT = 10; // for development only
export const ONE_SECOND_MS = 1000;
export const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
export const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;
export const PENDING_HOURS = 24;
export const PRUNE_INTERVAL = 3600000;
export const ORDER_PRUNE = 'pruneOrder';
export const SET_ALLOWANCE = 'setAllowance';
export const START_RELAYER = 'startRelayer';
export const PRICE_PRECISION = 8;
export const MIN_ORDER_BOOK_LEVELS = 4;
export const MIN_SIDE_LIQUIDITY = 50;
export const MIN_ETH_BALANCE = 3;
export const MIN_WETH_BALANCE = 2;
export const TARGET_WETH_BALANCE = 6;
export const MAX_WETH_BALANCE = 8;
export const MIN_TOKEN_BALANCE = 100;
export const TARGET_TOKEN_BALANCE = 300;
export const MAX_TOKEN_BALANCE = 400;
export const FAUCET_ADDR = '0x00D8d0660b243452fC2f996A892D3083A903576F';

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

export const ALLOWANCE = 'allowance';
