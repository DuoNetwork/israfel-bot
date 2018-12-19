export * from '../../../duo-admin/src/common/types';
export * from '../../../duo-contract-wrapper/src/types';
export {
	IWsResponse,
	IWsOrderBookResponse,
	IWsOrderResponse,
	IWsRequest,
	IWsInfoResponse,
	IOrderBookSnapshot,
	IToken,
	IWsAddOrderRequest
} from '../../../israfel-relayer/src/common/types';

export interface IOption {
	live: boolean;
	token: string;
	baseToken: string;
	type: string;
	tenor: string;
	source: string;
	provider: string;
	debug: boolean;
}

export interface IBaseMarketData {
	source: string;
	base: string;
	quote: string;
	timestamp: number;
}

export interface IPrice extends IBaseMarketData {
	period: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface IAccounts {
	address: string;
	privateKey: string;
}
