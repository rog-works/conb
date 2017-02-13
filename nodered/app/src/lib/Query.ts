import * as ko from 'knockout';
import * as $ from 'cheerio';
import DAO from './DAO';

export default class Query {
	public static PARSE_QUERY: RegExp = /^select\s+(.+)\s+from\s+([^\s]+)\s+where\s+(.+)/
	public static SELECT_QUERY: RegExp = /(.+)\s+as\s+([\w.]+)/
	public constructor(
		private _e: Cheerio
	) {}
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
		this._e.each((_, elem) => {
			let row = {};
			for (const queries of fieldOfQueries) {
				row = ko.utils.extend(row, this._selectQuery($(elem), queries));
			}
			rows.push(row);
		});
		return rows;
	}
	private _selectQuery(e: Cheerio, queries: string): {} {
		const matches = queries.match(Query.SELECT_QUERY) || [];
		matches.shift();
		const value = matches.shift() || '';
		const as = matches.shift() || '';
		const result = this._invoke(e, value);
		return { [as]: result };
	}
	private _invoke(context: any, script: string): any {
		return eval(`(function f($){ return ${script}; })`)(context);
	}
}
