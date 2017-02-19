interface QueryMap {
	[key: string]: string
}

export default class URI {
	private _origin: string
	private _scheme: string
	private _host: string
	private _path: string
	private _queries: QueryMap
	public constructor(uri: string) {
		const [scheme, host, path, queries] = URI._parse(uri);
		this._origin = uri;
		this._scheme = scheme;
		this._host = host;
		this._path = path;
		this._queries = URI._parseQueies(queries);
	}
	public static _parse(uri: string): string[] {
		const matches = uri.match(/^([^:]+):\/\/([^\/]+)(\/[^?]*)(?:[?]([^#]+))?/); // XXX inaccuracy
		if (!matches || matches.length !== 5) {
			throw new Error(`Unexpected URI. ${uri}`);
		}
		return [
			matches[1],
			matches[2],
			matches[3],
			matches[4] || '',
		];
	}
	public static _parseQueies(queries: string): QueryMap {
		const map: QueryMap = {};
		for (const query of queries.split('&')) {
			if (query.length > 0) {
				const [key, value] = query.split('=');
				map[key] = value;
			}
		}
		return map;
	}
	public get scheme(): string {
		return this._scheme;
	}
	public get host(): string {
		return this._host;
	}
	public get path(): string {
		return this._path;
	}
	public query(key: string): string {
		return this._queries[key] || '';
	}
	public hasQuery(key: string) {
		return key in this._queries;
	}
}
