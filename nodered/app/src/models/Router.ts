
interface Handlers {
	[path: string]: Function
}

interface Matchers {
	[path: string]: RegExp
}

export default class Router {
	private static _self: Router
	private _handlers: Handlers
	private _matchers: Matchers
	public constructor() {
		this._handlers = {};
		this._matchers = {};
	}
	public static get self(): Router {
		return Router._self || (Router._self = new Router());
	}
	public use(pattern: string, handler: Function): void {
		const key = pattern.toString();
		this._handlers[key] = handler;
		this._matchers[key] = new RegExp(pattern);
	}
	public get<T extends Object>(uri: string): T {
		const [handler, args] = this._dispache(uri);
		return handler(...args);
	}
	public async async<T extends Object>(uri: string): Promise<T> {
		const [handler, args] = this._dispache(uri);
		return await handler(...args);
	}
	private _dispache(uri: string): [Function, string[]] {
		for (const key of Object.keys(this._matchers)) {
			const matcher = this._matchers[key];
			if (matcher.test(uri)) {
				const args = uri.match(matcher);
				args.shift();
				return [this._handlers[key], args];
			}
		}
		throw new Error(`Unmatch route. ${uri}`);
	}
}

export interface Behavior {
	before(): (...any) => any
	after(): (...any) => any
}

class EntryProvider {
	public async load(query: string): Promise<Entry[]> {
		return await Router.self.async<Entry[]>(query); // FIXME
	}
}

class URI {
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
	public _parse(uri: string) {
		const matches = uri.match(/^(?:([^:]+):\/\/)?([^\/]+)\/([^?]+)(?:[?&]([^&#]+))*/);
		return [
			matches.shift() || '',
			matches.shift() || '',
			matches.shift() || '',
			matches.shift() || ''
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

class Mapper {
	public fetch(content: string): Entry[] {
		return [];
	}
}

export class Site {
	public name: string
	public from: string
	public query: string
	public constructor() {
		Router.self.use('/sites', Site.index.bind(this));
		Router.self.use('/sites/show', Site.show.bind(this));
	}
	public static async index(): Promise<Entry[]> {
		// /sites
		return await Site.find();
	}
	public static async show(query?: string, tags?: string): Promise<Entry> {
		// /sites/show(?:[?&]([^=]+=[^&]+))*
		const query = await Router.self.async(`/queries/show?uri=${uri}`);
		return new Entry();
	}
	public async load(): Promise<Entry[]> {
		const content = await Router.self.async<string>(this.from);
		const map = await Router.self.async<Mapper>(`/maps/show/${this.query}`);
		return map.fetch(content);
	}
}

export class Post {
	public constructor() {
		Router.self.use('http', Post.index.bind(this));
	}
	public static async index(uri: string): Promise<Entry[]> {
		// protocol://[user[:pass]@]host[:port][/path][?query][#flagment]
		return await DAO.get('html', uri);
	}
}

export class Entry {
	public constructor() {
		Router.self.use('/entries/index', Entry.index.bind(this));
		Router.self.use('/entries/show', Entry.show.bind(this));
		Router.self.use('/entries/edit', Entry.edit.bind(this));
		Router.self.use('/entries/create', Entry.create.bind(this));
		Router.self.use('/entries/destroy', Entry.destroy.bind(this));
	}
	public attach(behavior: Behavior): void {
	}
	public static async find(data: any): Promise<Entry[]> {
		return [];
	}
	public async get(): Promise<Entry> {
		return new Entry();
	}
	public static async index(query?: string, tags?: string): Promise<Entry[]> {
		// /entries/index[?query=query][&tags=tag,tag]
		const where = {};
		if (tags) {
			where['attrs.tags'] = { '$in': tags };
		}
		if (query) {
			where['attrs.post.text'] = `/${query}/`;
		}
		return await Entry.find(where);
	}
	public static async show(uri: string): Promise<Entry> {
		// /entries/show/([\w\d]+)
		return new Entry(uri).get();
	}
}