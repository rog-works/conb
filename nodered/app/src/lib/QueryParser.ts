export default class QueryParser {
	private readonly _org: string
	private readonly _syntax: any // XXX 
	public constructor(query: string) {
		this._org = query;
		this._syntax = this._parse(this._org.split(' '));
	}
	private _parse(tokens: string[]): any {
		for (const token of tokens) {
			
		}
		return syntax;
	}
	private _parse_select(tokens: string[], begin: number) {
		if (/select/.test(tokens[begin++])) {
			const [next, projection] = this._parse_projection(tokens, begin);
			if (begin < next) {
				return [
					next,
					{
						type: 'select',
						projection: projection
					};
				];
			}
		}
		return [begin, {}];
	}
	private _parse_projection(tokens: string[], begin) {
		
	}
	public execute(syntax: any): void {
		const out: any = {};
		for (const com of syntax) {
			out = this[`_com_${com.type}`](com, out);
		}
	}
}

/code
export default class Query {
	public constructor(query: string) {
		Router.create(this.parseURI(query));
	}
	public uri(query: string) {
		return 'scheme://user:pass@host:port/path?query#flagment';
	}
	public shorthand(query: string) {
		return '/resource/action?query#flagment';
	}
	public select(query: string) {
		const selectSyntax = {
			type: "select",
			projection: {
				type: "projection",
				projctions: [
					{
						type: "column",
						value: {
							name: "column1",
							type: "identifer"
						},
						as: "alias1"
					},
					{
						type: "column",
						value: {
							type: "memberexp",
							property: {
								name: "attr",
								type: "identifer"
							},
							object: {
								type: "callexp",
								calle: {
									name: "$",
									type: "identifer"
								},
								args: [
									{
										value: ".post > a > img",
										type: "string"
									}
								]
							}
						},
						as: "alias2"
					}
				]
			},
			from: {
				name: "table",
				type: "identifer"
			},
			where: {
				type: "where",
				condition: {
					type: "compexp",
					left: {
						value: 123,
						type: "numeric"
					},
					operator: "<",
					right: {
						value: 321,
						type: "numeric"
					}
				}
			},
			order: {
				name: "column",
				type: "identifer"
			},
			limit: {
				skip: {
					value: 0,
					type: "numeric"
				},
				count: {
					value: 10,
					type: "numeric"
				}
			}
		};
		/^(sql:\/\/)?select ((,?[^,]+)+|\*) from ([^ ]+)( where)?( order)?( limit)?/;
		return 'select <projection> from <resource> [where <conditions>] [order <field>] [limit <count>|<skip>,<count>]]';
	}
	public update(query: string) {
		return 'update <resource> set <updates> [where <conditions>]';
	}
	public pluck(query: string) {
		return `{href: $('.class > tag[key="value"]').attr('href'), text: $('.class > tag[key="value"]').text()}`;
	}
	public parseURI(uri: string) {
		return uri.match(/^([^:]+):\/\/([^\\]+)\/([^?]*)(\?[^#]*)?(#.*)?$/);
	}
}
 
class Dispatcher {
	public static has(uri: string): boolean {
		return /^(xxx:|^\/)/.test(uri);
	}
}
 
class SQL {
	constructor(private query: string) {}
	public static has(uri: string): boolean {
		return /^(sql:|select|update)/.test(uri);
	}
	public static create(uri: string) {
		const query = uri.replace(/^sql:[ ]*/, '');
		return new SQL(query);
	}
	private _parse(query: string) {
		return this._parsSQL(query);
	}
	private _parseSQL(query: string) {
		const tokens = this._parseToken(query);
		const syntax = this._parseSyntax(tokens);
		const semantics = this._analyzeSemantics(syntax);
		
	}
	private _analyzeSemantics(syntax: any, _in?: any) {
		let out: any = _in;
		for (const key of Object.keys(syntax)) {
			out = this[`_execute_${key}`](syntax[key], out);
		}
		return out;
	}
	private _execute_column(syntax: any, _in: any) {
		const column = this._analyzeSemantics(syntax.value, _in);
		if (syntax.as) {
			_in[syntax.as] = _in[column];
			delete _in[column];
		}
		return _in[syntax.as || column];
	}
	private _execute_memberexp(syntax: any, _in: any) {
		const property = this._analyzeSemantics(syntax.property, _in);
		const object = this._analyzeSemantics(syntax.object, _in);
		const value = object[property];
		const actual = syntax.as || column;
		this._write(column, value, actual);
	}
}
 
class Web {
	public static has(uri: string): boolean {
		return /^https?:/.test(uri)
	}
}
 
class Router {
	public static create([uri, protocol, host, path, query, flagment]) {
		for (const dispatcher of [Web, SQL, Dispatcher]) {
			if (dispatcher.has(uri)) {
			}
		}
	}
}