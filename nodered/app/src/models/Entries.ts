import * as ko from 'knockout';
import EventEmitter from '../lib/EventEmitter';
import DAO from '../lib/DAO';
import Path from '../lib/Path';
import Query from '../lib/Query';
import ModelFactory from './ModelFactory';
import {default as Entry, EntryEntity} from './Entry';
import {default as Post, PostEntity} from './Post';
import {default as File, FileEntity} from './File';
import Site from './Site';
import {URIBuilderTest} from '../lib/URIBuilder';

export default class Entries extends EventEmitter {
	public list: KnockoutObservableArray<Entry>
	public constructor() {
		super('beforeUpdate', 'update');
		this.list = ko.observableArray([]);
	}
	public load(uri: string, path: string, query: string, page: number): void {
		this.emit('beforeUpdate', this, page); // XXX page?
		if (/^https?:\/\//.test(uri)) {
			this._loadPostsByUrl(uri, page);
		} else if (/^(select|from)/.test(uri)) {
			this._loadPostsByQuery(uri, page);
		} else if (/^\/sites\/posts\//.test(uri)) {
			this._loadPosts(uri, page);
		} else if (/^\/sites\//.test(uri)) {
			this._loadSites(uri, page);
		} else if (/^\/entries\//.test(uri)) {
			this._loadEntries(uri, page);
		} else {
			throw Error(`Unexpected uri. ${uri}, ${/^\/sites\/posts\//.test(uri)}`);
		}
	}
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
		const matches = query.match(/from\s+([^\s]+)(?:\s+where\s+(.+))/);
		if (!matches || matches.length !== 2) {
			throw new Error(`Unexpected query. ${query}`);
		}
		const uri = matches[1];
		const where = `page=${page} and ${matches[2]}`;
		const siteEntry = (await Entry.find({
			where: uri,
			skip: 0,
			limit: 1
		})).pop();
		if (!siteEntry) {
			throw new Error(`Unknown site. ${uri}`);
		}
		const site = siteEntry.getAttr<Site>('site');
		// 
		let _where = site.where();
		for (const cond of matches[2].split(/\s+and\s+/)) {
			const params = cond.split(/\s+=\s+/);
			if (params.length !== 2) {
				throw new Error(`Unexpected query. ${query}`);
			}
			const key = params[0];
			const value = params[1];
			_where = _where.split(`{${key}}`).join(value);
		}
		
		for (const cond of [""]) {
			const params = cond.split(/\s+=\s+/);
			if (params.length !== 2) {
				throw new Error(`Unexpected query. ${query}`);
			}
			const key = params[0];
			const value = params[1];
			const wheres: any[] = [{key:""}];
			for (const __where of wheres) {
				if (key !== __where.key) {
					continue;
				}

			}
		}
		const from = site.from().replace('{where}', _where);
		// 
		const postEntities = await Query.create()
			.select(site.select().map(select => select.value()))
			.from(from)
			.where('')
			.build()
			.exec();
		for (const postEntity of postEntities) {
			const entity = {
				type: 'entry',
				uri: postEntity.href,
				attrs: {
					post: postEntity,
					tags: { type: 'tags', tags: [] },
					files: { type: 'files', entries: [] },
				}
			};
			const entry = ModelFactory.self.create<Entry>(entity);
			entry.get();
			this.list.push(entry);
		}
		this.emit('update', this, postEntities);
	}
	private _loadSites(url: string, page: number): void {
		this._loadEntries('/entries/{"attrs.site":{"$exists":true}}', page);
	}
	private async _loadPosts(url: string, page: number): Promise<void> {
		const where = { ['attrs.site.name']: url.substr('/sites/'.length) };
		const siteEntry = (await Entry.find({
			where: where,
			skip: 0,
			limit: 1
		})).pop();
		if (!siteEntry) {
			throw new Error(`Unknown site. ${url}`);
		}
		const site = siteEntry.getAttr<Site>('site');
		const postEntities = await site.load<PostEntity>({ page: page });
		for (const postEntity of postEntities) {
			const entity = {
				type: 'entry',
				uri: postEntity.href,
				attrs: {
					post: postEntity,
					tags: { type: 'tags', tags: [] },
					files: { type: 'files', entries: [] },
				}
			};
			const entry = ModelFactory.self.create<Entry>(entity);
			entry.get();
			this.list.push(entry);
		}
		this.emit('update', this, postEntities);
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
		this.list().forEach(entry => entry.closed = !entry.closed);
	}
	public filtered(query: string): void {
		this.list().forEach(entry => entry.closed = true)
		this.findByQuery(query).forEach(entry => entry.closed = false);
	}
	public export(): string {
		return JSON.stringify(this.list().map((entry: Entry) => entry.export()));
	}
	public import(entities: any[]): void {
		entities.forEach((entity: any) => this.list.push(ModelFactory.self.create<Entry>(entity)));
		this.emit('update', this);
	}
	public selectedEntries(): Entry[] {
		return this.list().filter(entry => entry.selected);
	}
	public findByQuery(query: string): Entry[] {
		if (/^\/[^\/]*\//.test(query)) {
			const reg = new RegExp(query.substr(1, query.length - 2));
			return this.list().filter(entry => reg.test(entry.description));
		} else {
			return this.list().filter(entry => entry.description.indexOf(query) !== -1);
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
		console.log(URIBuilderTest.create());
	/*	for (let i = 0; i < 5; i += 1) {
			const entity = {
				type: 'entry',
				uri: 'https://google.co.jp/' + i,
				attrs: {
					post: {
						type: 'post',
						href: 'https://google.co.jp/' + i,
						src: '',
						text: 'hogehoge, ' + i,
						date: 'none'
					},
					tags: {
						type: 'tags',
						tags: [
							{ type: 'tag', name: 'hoge0' },
							{ type: 'tag', name: 'hoge1' },
							{ type: 'tag', name: 'hoge2' },
						]
					},
					files: {
						type: 'files',
						entries: [
							{
								type: 'entry',
								uri: `https://google.co.jp/${i}/1.jpg`,
								attrs: {
									post: {
										type: 'post',
										href: `https://google.co.jp/${i}/1.jpg`,
										src: `https://google.co.jp/${i}/1.jpg`,
										text: `${i}/1.jpg`,
										date: 'none'
									},
									file: {
										type: 'file',
										path: `${i}.jpg`,
										size: 0,
										date: 'none',
										store: false
									}
								}
							}
						]
					}
				}
			};
			const entry = ModelFactory.self.create<Entry>(entity);
			entry.get();
			this.list.push(entry);
		}*/
	}
}
