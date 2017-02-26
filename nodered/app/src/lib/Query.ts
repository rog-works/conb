import * as ko from 'knockout-es5';
import * as $ from 'cheerio';
import DAO from './DAO';
import Util from '../utils/Util';

export default class Query {
	public constructor(
		private _uri: string,
		private _normalizer: string,
		private _fieldOfQueries: string[]
	) {}
	public static select(fieldOfQueries: string[]): QueryBuilder {
		return new QueryBuilder().select(fieldOfQueries);
	}
	public async async<T>(): Promise<T[]> { // FIXME T not used
		const content = await QueryExecutor.load(this._uri);
		const elems = QueryExecutor.normalize(content, this._normalizer);
		return QueryExecutor.projection(elems, this._fieldOfQueries);
	}
}

class QueryBuilder {
	public constructor(
		private _from: string = '',
		private _uri: string = '',
		private _normalizer: string = '',
		private _fieldOfQueries: string[] = []
	) {}
	public from(from: string): this {
		this._uri = from;
		return this;
	}
	public where(where: string): this {
		this._normalizer = where;
		return this;
	}
	public select(fieldOfQueries: string[]): this {
		this._fieldOfQueries = fieldOfQueries;
		return this;
	}
	public build(): Query {
		return new Query(this._uri, this._normalizer, this._fieldOfQueries);
	}
	public async<T>(): Promise<T[]> {
		return this.build().async();
	}
}

class QueryExecutor {
	public static async load(from: string): Promise<string> {
		return await DAO.self.get<string>('html', { url: from });
	}
	public static normalize(content: string, normalizer: string): Cheerio {
		return Util.evaluate<Cheerio>($(content), normalizer);
	}
	public static projection(elems: Cheerio, fieldOfQueries: string[]): any[] {
		const rows: any[] = [];
		elems.each((_, elem) => {
			let row = {};
			for (const queries of fieldOfQueries) {
				const field = QueryExecutor._selectQuery($(elem), queries);
				row = Util.extend(row, field);
			}
			rows.push(row);
		});
		return rows;
	}
	private static _selectQuery(elem: Cheerio, queries: string): {} {
		const matches = queries.match(/(.+)\s+as\s+([\w.]+)/) || [];
		matches.shift();
		const filter = matches.shift() || '';
		const key = matches.shift() || '';
		const value = Util.evaluate<any>(elem, filter);
		return Util.createObject(key, value);
	}
}
