import * as ko from 'knockout';
import EventEmitter from '../lib/EventEmitter';
import DAO from '../lib/DAO';
import ModelFactory from './ModelFactory';
import {default as Entry, EntryEntity} from './Entry';
import Post from './Post';
import File from './File';

export default class Entries extends EventEmitter {
	public list: KnockoutObservableArray<Entry>
	private _resolve: Function
	public constructor() {
		super('beforeUpdate', 'update');
		this.list = ko.observableArray([]);
		// FIXME
		this._resolve = (self: any, message: MessageEvent) => {
			const response = JSON.parse(message.data);
			console.log('many respond', response);
			const entry = <Entry>ModelFactory.self.create(response.data);
			entry.get();
			this.list.push(entry);
			this.emit('update', this);
		};
	}
	public load(url: string, path: string, query: string, page: number): void {
		this.emit('beforeUpdate', this, page); // XXX page?
		if (/^https?:/.test(url)) {
			this._loadUrl(url, page);
		} else if (/^db:/.test(url)) {
			this._loadDB(url, page);
		}
	}
	private _loadDB(url: string, page: number): void {
		const where = this._toWhere(url.substr('db://'.length));
		DAO.self.once('entries/index', {
				where: where,
				skip: page * 50,
				limit: 50
			})
			.then((entities: EntryEntity[]) => {
				for(const entity of entities) {
					this.list.push(<Entry>ModelFactory.self.create(entity));
				}
			});
	}
	private _toWhere(query: string): any {
		return {}; // XXX impl
	}
	private _loadUrl(url: string, page: number): void {
		DAO.self.many('posts', {
				url: url.replace(/{page}/, `${page}`),
				page: page
			})
			.then(this._resolve); // FIXME mock
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
		entities.forEach((entity: any) => this.list.push(<Entry>ModelFactory.self.create(entity)));
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
		const baseDir = File.confirm(File.real(''));
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
		for (let i = 0; i < 1; i += 1) {
			const entity = {
				type: 'entry',
				uri: 'https://google.co.jp/' + i,
				attrs: [
					{
						type: 'post',
						href: 'https://google.co.jp/' + i,
						src: '',
						text: 'hogehoge, ' + i,
						date: 'none'
					}
				]
			};
			this.list.push(<Entry>ModelFactory.self.create(entity));
		}
	}
}
