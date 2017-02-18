import * as ko from 'knockout';
import * as $ from 'cheerio';
import DAO from './DAO';

export default class Query {
	public static SELECT_QUERY: RegExp = /(.+)\s+as\s+([\w.]+)/
	public constructor(
		private _uri: string,
		private _normalizer: string,
		private _fieldOfQueries: string[]
	) {}
	public static create(): QueryBuilder {
		return new QueryBuilder();
	}
	public async exec(): Promise<any[]> {
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
		const matches = from.match(/^\$\("(.+)"\)(.+)$/);
		if (!matches || matches.length !== 3) {
			throw new Error(`Unexpected from format. ${from}`);
		}
		this._from = from;
		this._uri = matches[1];
		this._normalizer = `$${matches[2]}`;
		return this;
	}
	public where(where: string): this {
		if (!/\s+and\s+/.test(where)) {
			return this;
		}
		let from = this._from;
		for (const cond of where.split(/\s+and\s+/)) {
			const params = cond.split(/\s*=\s*/);
			if (params.length != 2) {
				throw new Error(`Unexpected where format. ${where}`);
			}
			const key = params[0];
			const value = params[1];
			from = from.split(`${key}`).join(value);
		}
		this._uri = from;
		return this;
	}
	public select(fieldOfQueries: string[]): this {
		this._fieldOfQueries = fieldOfQueries;
		return this;
	}
	public build(): Query {
		return new Query(this._uri, this._normalizer, this._fieldOfQueries);
	}
}

class QueryExecutor {
	public static async load(from: string): Promise<string> {
		return await DAO.self.get<string>('html', { url: from });
	}
	public static normalize(content: string, normalizer: string): Cheerio {
		return QueryExecutor._invoke<Cheerio>($(content), normalizer);
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
		const matches = queries.match(Query.SELECT_QUERY) || [];
		matches.shift();
		const value = matches.shift() || '';
		const as = matches.shift() || '';
		const result = QueryExecutor._invoke<string>(e, value);
		return { [as]: result };
	}
	private static _invoke<T>(context: Cheerio, script: string): T {
		return eval(`(function f($){ return ${script}; })`)(context);
	}
}
