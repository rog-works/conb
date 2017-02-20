import * as ko from 'knockout';
import * as $ from 'cheerio';
import DAO from './DAO';

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
		const e = QueryExecutor.normalize(content, this._normalizer);
		return QueryExecutor.projection(e, this._fieldOfQueries);
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
		return QueryExecutor._evaluate<Cheerio>($(content), normalizer);
	}
	public static projection(e: Cheerio, fieldOfQueries: string[]): any[] {
		const rows: any[] = [];
		e.each((_, elem) => {
			let row = {};
			for (const queries of fieldOfQueries) {
				row = ko.utils.extend(row, QueryExecutor._selectQuery($(elem), queries));
			}
			rows.push(row);
		});
		return rows;
	}
	private static _selectQuery(e: Cheerio, queries: string): {} {
		const matches = queries.match(/(.+)\s+as\s+([\w.]+)/) || [];
		matches.shift();
		const value = matches.shift() || '';
		const as = matches.shift() || '';
		const result = QueryExecutor._evaluate<any>(e, value);
		return QueryExecutor._createRoute(as, result);
	}
	private static _evaluate<T>(context: Cheerio, script: string): T {
		return eval(`(function f($){ return ${script}; })`)(context);
	}
	private static _createRoute(route: string, value: any): any {
		const obj: any = {};
		let ref: any = obj;
		for (const key of route.split('.')) {
			ref[key] = {};
			ref = ref[key];
		}
		ref = value;
		return obj;
	}
}
