import * as ko from 'knockout';
import EventEmitter from '../lib/EventEmitter';
import DAO from '../lib/DAO';
import ModelFactory from './ModelFactory';
import {Entry, Post, PostEntity} from './Entry';
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
			this.list.push(ModelFactory.self.create(response.data));
			this.emit('update', this);
		};
	}
	public load(url: string, path: string, query: string, page: number): void {
		this.emit('beforeUpdate', this, page); // XXX page?
		DAO.self.many('posts', {
				url: url.replace(/{page}/, `${page}`),
				path: path,
				query: query,
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
		entities.forEach((entity: any) => this.list.push(ModelFactory.self.create(entity)));
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
		for(const entry of entries) {
			if (entry instanceof Post) {
				const post = <Post>entry;
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
		for (let i = 0; i < 5; i += 1) {
			const entity = {
				_id: '',
				type: 'post',
				signature: Entry.sign('https://google.co.jp/' + i),
				uri: 'https://google.co.jp/' + i,
				attrs: [
					{
						_id: '',
						type: 'retention',
						visit: false,
						store: false,
						bookmark: false
					}
				],
				href: 'https://google.co.jp/' + i,
				src: '',
				text: 'hogehoge, ' + i,
				date: 'none'
			};
			this.list.push(new Post(entity));
		}
	}
}
