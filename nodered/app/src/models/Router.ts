
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
		this._handlers[pattern] = handler;
		this._matchers[pattern] = new RegExp(pattern);
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
		return await Router.self.async<Entry[]>(query);
	}
}

class Querify {
	private _template: string
	public constructor(template: string) {
		this._template = template;
	}
	public build(map: any): string {
		let query = this._template;
		for (const key of Object.keys(map)) {
			query = query.replace(`{${key}}`, map[key]);
		}
		return query;
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
		Router.self.use('/sites/inquiry', Site.inquiry.bind(this));
	}
	public static async index(): Promise<Entry[]> {
		// /sites
		const where = { "attrs.site": { "$exists": true } };
		return await Router.self.async<Entry[]>(`/entries/search?where=${JSON.stringify(where)}`);
	}
	public static async inquiry(signature: string, query?: string, tags?: string): Promise<Entry> {
		// /sites/show/([^?]+)(?:[?&]([^=]+=[^&]+))*
		const querify = await Router.self.async(`/queries/show/${signature}`);
		return await Router.self.async<Entry[]>(querify.build({ query: query, tags: tags });
	}
}

export class Post {
	public constructor() {
		Router.self.use('http', Post.index.bind(this));
	}
	public static async index(uri: string): Promise<Entry[]> {
		// protocol://[user[:pass]@]host[:port][/path][?query][#flagment]
		const signature = Entry.sign(uri);
		const mapper = await Router.self.async<Mapper>(`/maps/show/${signature}`);
		const content = await DAO.get('html', uri);
		return mapper.fetch(content);
	}
}

export class Entry {
	public constructor() {
		Router.self.use('/entries(?:[?&]([^&#]+))*', Entry.index.bind(this));
		Router.self.use('/entries/show', Entry.show.bind(this));
		Router.self.use('/entries/edit', Entry.edit.bind(this));
		Router.self.use('/entries/create', Entry.create.bind(this));
		Router.self.use('/entries/destroy', Entry.destroy.bind(this));
		Router.self.use('/entries/search(?:[?&]([^&#]+))*', Entry.search.bind(this));
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
	public static async show(signature: string): Promise<Entry> {
		// /entries/show/([\w\d]+)
		return new Entry(signature).get();
	}
	public static async search(page?: number, where?: any): Promise<Entry[]> {
		return await Entry.find({
			where: where || {},
			skip: (page || 0) * 50,
			limit: 50
		});
	}
}