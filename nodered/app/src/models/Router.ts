
interface Handlers {
	[path: string]: Function
}
 
interface Matchers {
	[path: string]: RegExp
}
 
export default class Router {
	private static _self: Router
	private _routes: Handlers
	private _matchers: Matchers
	public constructor() {
		this._routes = {};
		this._matchers = {};
	}
	public static get self(): Router {
		return Router._self || (Router._self = new Router());
	}
	public use(path: string | RegExp, callback: Function): void {
		const key = path.toString();
		const exp = path instanceof RegExp ? path : new RegExp(path);
		this._routes[key] = callback;
		this._matchers[key] = exp;
	}
	public get<T extends Object>(path: string): T {
		const [handler, args] = this._dispache(path);
		return handler(...args);
	}
	public async async<T extends Object>(path: string): Promise<T> {
		const [handler, args] = this._dispache(path);
		return await handler(...args);
	}
	private _dispache(path: string): [Function, string] {
		for (const key of Object.keys(this._matchers)) {
			if (this._matchers[key].test(path)) {
				const matches = path.match(this._matchers[key]);
				matches.shift();
				return [this._routes[key], matches];
			}
		}
		throw new Error(`Unmatch route. ${path}`);
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
 
export class Site {
	public name: string
	public from: string
	public query: string
	public constructor() {
		Router.self.use('/sites/index(/[^/]+/)', Site.index.bind(this));
		Router.self.use('/sites/show', Site.show.bind(this));
	}
	public static async index(uri: string): Promise<Entry[]> {
		// /sites/index
		return [];
	}
	public static async show(uri: string): Promise<Entry> {
		// /sites/show</path/to/>[/<query>][?tags=tag,tag]
		return new Entry();
	}
	public async load(): Promise<Entry[]> {
		const content = await Router.self.async<string>(this.from);
		const query = await Router.self.async<Query>(`/queries/show/${this.query}`);
		return query.fetch(content);
	}
}
 
class Query {
	public fetch(content: string): Entry[] {
		return [];
	}
}
 
export class Post {
	public constructor() {
		Router.self.use(/^http.+$/, Post.index.bind(this));
	}
	public static async index(uri: string): Promise<Entry[]> {
		// protocol://[user[:pass]@]host[:port][/path][?query][#flagment]
		return [];
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
	public static async index(query: string, tags: string): Promise<Entry[]> {
		// /entries/index[/query][?tags=tag,tag]
		return await Entry.find({
			where: {
				'attrs.tags': {'$in': tags},
				'attrs.post.text': `/${query}/`
			}
		});
	}
	public static async show(uri: string): Promise<Entry> {
		// /entries/show/<signature>
	}
}