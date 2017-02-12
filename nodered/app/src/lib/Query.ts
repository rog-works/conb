import * as $ from 'jquery'
import DAO from './DAO'

export default class Query {
	public static PARSE_QUERY: RegExp = /^select\s+(.+)\s+from\s+([^\s]+)\s+where\s+(.+)/
	public static SELECT_QUERY: RegExp = /^\$\("([^"]+)"\)\.([^(]+)\(\)\s+as\s+([\w.]+)/
	public static SELECT_QUERY_ATTR: RegExp = /^\$\("([^"]+)"\)\.([^(]+)\("([^"]+)"\)\s+as\s+([\w.]+)/
	public static SELECT_QUERY_LITERAL: RegExp = /(.+)\s+as\s+([\w.]+)/
	public constructor(private _e: JQuery) {}
	public static parse(query: string): RegExpMatchArray | null {
		return query.match(Query.PARSE_QUERY);
	}
	public static async from(from: string): Promise<Query> {
		const html = await DAO.self.get<string>('html', { url: from });
		return new Query($(html));
	}
	public where(queries: string): Query {
		const matches = queries.match(/^\$\("(.+)"\)$/) || [];
		matches.shift();
		const query = matches.shift() || '';
		return new Query(this._e.find(query));
	}
	public select(fieldOfQueries: string[]): any[] {
		const rows: any[] = [];
		this._e.each((index, elem) => {
			let row = {};
			for (const queries of fieldOfQueries) {
				// if (this._hasSelectQuery(queries)) {
				// 	row = $.extend(row, this._selectQuery($(elem), queries));
				// } else if (this._hasSelectQueryAttr(queries)) {
				// 	row = $.extend(row, this._selectQueryAttr($(elem), queries));
				// } else if (this._hasSelectQueryLiteral(queries)) {
				// 	row = $.extend(row, this._selectQueryLiteral($(elem), queries));
				// }
				row = $.extend(row, this._selectQueryEval($(elem), queries));
			}
			rows.push(row);
		});
		return rows;
	}
	private _hasSelectQuery(queries: string): boolean {
		return Query.SELECT_QUERY.test(queries);
	}
	private _hasSelectQueryAttr(queries: string): boolean {
		return Query.SELECT_QUERY_ATTR.test(queries);
	}
	private _hasSelectQueryLiteral(queries: string): boolean {
		return Query.SELECT_QUERY_LITERAL.test(queries);
	}
	private _selectQuery(e: JQuery, queries: string): {} {
		const matches = queries.match(Query.SELECT_QUERY) || [];
		matches.shift();
		const query = matches.shift() || '';
		const verb = matches.shift() || '';
		const as = matches.shift() || '';
		return { [as]: e.find(query)[verb]() };
	}
	private _selectQueryAttr(e: JQuery, queries: string): {} {
		const matches = queries.match(Query.SELECT_QUERY_ATTR) || [];
		matches.shift();
		const query = matches.shift() || '';
		const verb = matches.shift() || '';
		const prop = matches.shift() || '';
		const as = matches.shift() || '';
		return { [as]: e.find(query)[verb](prop) };
	}
	private _selectQueryLiteral(e: JQuery, queries: string): {} {
		const matches = queries.match(Query.SELECT_QUERY_LITERAL) || [];
		matches.shift();
		const value = matches.shift() || '';
		const as  = matches.shift() || '';
		return JSON.parse(`{"${as}":${value}}`);
	}
	private _selectQueryEval(e: JQuery, queries: string): {} {
		const matches = queries.match(Query.SELECT_QUERY_LITERAL) || [];
		matches.shift();
		const value = matches.shift() || '';
		const as  = matches.shift() || '';
		const result = this._invoke(e, value);
		return { [as]: result };
	}
	private _invoke(context: any, script: string): any {
		return eval(`(function f($){ return ${script}; })`)(context);
	}
}
