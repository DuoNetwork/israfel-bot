export * from '../../../duo-admin/src/common/types';
export * from '../../../duo-contract-wrapper/src/types';
import { ChildProcess } from 'child_process';

export interface IOption {
	env: string;
	tokens: string[];
	contractType: string;
	token: string;
	debug: boolean;
	server: boolean;
}

export interface ISubProcess {
	token: string;
	instance: ChildProcess;
	lastFailTimestamp: number;
	failCount: number;
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

export interface ICreateOB  {
	pair: string;
	isBid: boolean;
	contractTenor: string;
	midPrice: number;
	totalSize: number;
	numOfOrders: number;
	existingPriceLevel: number[]
}

export interface IPriceGrid  {
	relStrike: number[],
	timeToMaturity: number[],
	data: number[][]
}

export interface IPriceReference {
	call: IPriceGrid;
	put: IPriceGrid;
}
