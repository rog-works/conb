import * as ko from 'knockout-es5';
import EventEmitter from '../lib/EventEmitter';
import DAO from '../lib/DAO';
import Path from '../lib/Path';
import Query from '../lib/Query';
import URI from '../lib/URI';
import ModelFactory from './ModelFactory';
import {default as Entry, EntryEntity} from './Entry';
import {default as Post, PostEntity} from './Post';
import {default as File, FileEntity} from './File';
import Site from './Site';
import URIBuilder from '../lib/URIBuilder';
export default class Entries extends EventEmitter {
	public constructor(
		public list: Entry[] = []
	) {
		super('beforeUpdate', 'update');
		ko.track(this);
	}
	public load(uri: string, path: string, query: string, page: number): void {
		this.emit('beforeUpdate', this, page); // XXX page?
		if (/^from/.test(uri)) {
			this._loadPostsByQuery(uri, page);
		} else if (/^\/sites\/posts\//.test(uri)) {
			this._loadPosts(uri, { page: page });
		} else if (/^\/sites\//.test(uri)) {
			this._loadSites(uri, page);
		} else if (/^\/entries\//.test(uri)) {
			this._loadEntries(uri, page);
		} else {
			throw Error(`Unexpected uri. ${uri}, ${/^\/sites\/posts\//.test(uri)}`);
		}
	}
	// deprecated
	private async _loadPostsByUrl(url: string, page: number): Promise<void> {
		const entities = await DAO.self.get<EntryEntity[]>(
			'posts',
			{ url: url.replace(/{page}/, `${page}`) }
		);
		for (const entity of entities) {
			const entry = ModelFactory.self.create<Entry>(entity);
			entry.get();
			this.list.push(entry);
		}
		this.emit('update', this, entities);
	}
	private async _loadPostsByQuery(query: string, page: number): Promise<void> {
		const matches = query.match(/from\s+([^\s]+)(?:\s+where\s+(.+))?/);
		if (!matches || matches.length !== 3) {
			throw new Error(`Unexpected query. ${query}`);
		}
		const uri = /^http/.test(matches[1]) ? matches[1] : `/sites/posts/${matches[1]}`;
		const wheres = matches[2] || '';
		const params: any = { page: page };
		for (const where of wheres.split(/\s+and\s+/)) {
			if (where.length > 0) {
				if (/\s+in\s+/.test(where)) {
					const [key, _values] = where.split(/\s+in\s+/);
					const values = _values.split(/\s+/); // XXX short hand
					params[key] = values;
				} else if (/\s*=\s*/.test(where)) {
					const [key, value] = where.split(/\s*=\s*/);
					params[key] = value;
				} else {
					throw new Error(`Not supported operator. ${where}`);
				}
			}
		}
		this._loadPosts(uri, params);
	}
	private async _loadPosts(uri: string, params: any): Promise<void> {
		const where = /^http/.test(uri) ? { ['attrs.site.from.host']: new URI(uri).host } : { ['attrs.site.name']: uri.substr('/sites/'.length) };
		const siteEntries = await Entry.find({
			where: where,
			skip: 0,
			limit: 1
		});
		if (!siteEntries || siteEntries.length === 0) {
			throw new Error(`Site not found. ${uri}`);
		}
		const site = siteEntries[0].getAttr<Site>('site');
		const loadUri = /^http/.test(uri) ? new URI(uri) : site.createUri(params);
		const entities = await site.load<EntryEntity>(loadUri);
		for (const entity of entities) {
			const entry = ModelFactory.self.create<Entry>(entity);
			entry.get();
			this.list.push(entry);
		}
		this.emit('update', this, entities);
	}
	private _loadSites(url: string, page: number): void {
		this._loadEntries('/entries/{"attrs.site":{"$exists":true}}', page);
	}
	private async _loadEntries(url: string, page: number): Promise<void> {
		const where = this._toWhere(url.substr('/entries/'.length));
		const entries = await Entry.find({
			where: where,
			skip: Math.max(page - 1, 0) * 50,
			limit: 50
		});
		for (const entry of entries) {
			this.list.push(entry);
		}
		this.emit('update', this, entries);
	}
	private _toWhere(query: string): any {
		return query ? JSON.parse(query) : {}; // XXX impl
	}
	public remove(entry: Entry): void {
		this.list.remove(entry);
	}
	public cleared(): void {
		this.list.removeAll();
	}
	public fliped(): void {
		this.list.forEach(entry => entry.closed = !entry.closed);
	}
	public filtered(query: string): void {
		this.list.forEach(entry => entry.closed = true)
		this.findByQuery(query).forEach(entry => entry.closed = false);
	}
	public export(): string {
		return JSON.stringify(this.list.map((entry: Entry) => entry.export()));
	}
	public import(entities: any[]): void {
		entities.forEach((entity: any) => this.list.push(ModelFactory.self.create<Entry>(entity)));
		this.emit('update', this);
	}
	public selectedEntries(): Entry[] {
		return this.list.filter(entry => entry.selected);
	}
	public findByQuery(query: string): Entry[] {
		if (/^\/[^\/]*\//.test(query)) {
			const reg = new RegExp(query.substr(1, query.length - 2));
			return this.list.filter(entry => reg.test(entry.description));
		} else {
			return this.list.filter(entry => entry.description.indexOf(query) !== -1);
		}
	}
	public downloaded(): void {
		const entries = this.selectedEntries();
		if (entries.length === 0) {
			console.log('selected empty');
			return;
		}
		const baseDir = Path.confirm(Path.real(''));
		if (!baseDir) {
			console.log('download cancel');
			return;
		}
		for (const entry of entries) {
			for (const model of entry.attrs()) {
				if (!(model instanceof Post)) {
					continue;
				}
				const post = <Post>model;
				const matches = post.href.match(/^[^:]+:\/\/([^\/]+)/) || [];
				if (matches.length > 0) {
					const host = matches[1];
					const dir = `${baseDir}${host}/`;
					File.save(post.href, dir); // XXX save to host dir
				}
			}
		}
	}
	public test(): void {
	}
}
