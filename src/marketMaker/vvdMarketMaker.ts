// import {
// 	// Constants as WrapperConstants,
// 	DualClassWrapper,
// 	IDualClassStates
// 	// Web3Wrapper
// } from '@finbook/duo-contract-wrapper';
// import { IPrice } from '@finbook/duo-market-data';
// import {
// 	Constants,
// 	IAccount,
// 	IOrderBookSnapshot,
// 	IOrderBookSnapshotLevel,
// 	IToken,
// 	IUserOrder,
// 	OrderBookUtil,
// 	RelayerClient,
// 	Util,
// 	Web3Util
// } from '@finbook/israfel-common';
// import * as CST from '../common/constants';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import { IPriceGrid } from '../common/types';
import util from '../utils/util';
import BaseMarketMaker from './BaseMarketMaker';

class VvdMarketMaker extends BaseMarketMaker {
	public async loadPriceGrid(isCall: boolean): Promise<IPriceGrid> {
		return new Promise(resolve => {
			const stream = fs.createReadStream(
				`src/static/priceGrid${isCall ? 'Call' : 'Put'}.csv`
			);
			const pg: IPriceGrid = {
				relStrike: [],
				timeToMaturity: [],
				data: []
			};
			let isHeader = true;
			csv.fromStream(stream)
				.on('data', data => {
					if (isHeader) {
						pg.timeToMaturity = data.slice(1);
						isHeader = false;
					} else {
						pg.relStrike.push(util.round(Number(data[0].replace('%', '')) / 100, 3));
						pg.data.push(data.slice(1));
					}
				})
				.on('end', () => resolve(pg));
		});
	}

	public async start() {
		const callPriceGrid: IPriceGrid = await this.loadPriceGrid(true);
		// const putPriceGrid: IPriceGrid = await this.loadPriceGrid(false);
		console.log(callPriceGrid);
	}
}

const vvdMarketMaker = new VvdMarketMaker();
export default vvdMarketMaker;
