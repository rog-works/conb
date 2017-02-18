export default class URI {
	private _base: string
	private _scheme: string
	private _host: string
	private _path: string
	private _queries: any // XXX
	public constructor(uri: string) {
		const [scheme, host, path, queries] = this._parse(uri);
		this._base = uri;
		this._scheme = scheme;
		this._host = host;
		this._path = path;
		this._queries = {};
		for (const query of queries) {
			const [key, value] = query.split('=');
			this._queries[key] = value;
		}
	}
	public _parse(uri: string): string[] {
		const matches = uri.match(/^(?:([^:]+):\/\/)?([^\/]+)(\/[^?]+)(?:[?&]([^&#]+))*/);
		return [
			matches ? matches.shift() || '' : '',
			matches ? matches.shift() || '' : '',
			matches ? matches.shift() || '' : '',
			matches ? matches.shift() || '' : ''
		];
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
	public hasQuery(key: string) {
		return key in this._queries;
	}
	public query(key: string): string {
		return this._queries[key] || '';
	}
}
