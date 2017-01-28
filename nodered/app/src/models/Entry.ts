import * as Promise from 'promise';
import * as ko from 'knockout';
import EventEmitter from '../lib/EventEmitter';
import DAO from '../lib/DAO';
import Sign from '../lib/Sign';
import {Model, ModelEntity} from './Model';
import {default as Retention, RetentionEntity} from './Retention';
import File from './File';

export default class Entries extends EventEmitter {
	public list: KnockoutObservableArray<Entry>
	private __resolve: Function
	public constructor() {
		super('update');
		this.list = ko.observableArray([]);
		this.__resolve = this._resolve.bind(this); // FIXME
	}
	public load(url: string, path: string, query: string, page: number) {
		return DAO.self.many('posts', {
				url: url.replace(/{page}/, `${page}`),
				path: path,
				query: query,
				page: page
			})
			.then(this.__resolve); // FIXME
	}
	private _resolve(self: any, message: MessageEvent) { // FIXME
		const response = JSON.parse(message.data);
		console.log('many respond', response);
		this.list.push(EntryFactory.create(response.data));
		this.emit('update', this);
	}
	public remove(entry: Entry) {
		this.list.remove(entry);
	}
	public clear() {
		this.list.removeAll();
	}
	public fliped() {
		this.list().forEach(entry => entry.closed = !entry.closed);
	}
	public filtered(query: string) {
		this.list().forEach(entry => entry.closed = true)
		this.findByQuery(query).forEach(entry => entry.closed = false);
	}
	public export(): string {
		return JSON.stringify(this.list());
	}
	public import(json: string) {
		JSON.parse(json).forEach((entry: Entry) => this.list.push(entry));
		this.emit('update', this);
	}
	public selectedEntries(): Array<Entry> {
		return this.list().filter(entry => entry.selected);
	}
	public findByQuery(query: string): Array<Entry> {
		if (/^\/[^\/]*\//.test(query)) {
			const reg = new RegExp(query.substr(1, query.length - 2));
			return this.list().filter(entry => reg.test(entry.description));
		} else {
			return this.list().filter(entry => entry.description.indexOf(query) !== -1);
		}
	}
}

interface EntryEntity extends ModelEntity {
	type: string;
	uri: string;
	retention: RetentionEntity
}

export abstract class Entry extends Model {
	public type: string
	public uri: string
	public retention: Retention
	public css: any // XXX
	public constructor(type: string, uri: string) {
		super(Sign.digest(uri));
		this.type = type;
		this.uri = uri;
		this.retention = new Retention();
		this.css = {
			close: ko.observable(false),
			selected: ko.observable(false)
		};
		this.find(); // FIXME
	}
	abstract get description(): string
	// @override
	public get resource(): string {
		return 'entries';
	}
	public import(entity: EntryEntity) {
		super.import(entity);
		this.type = entity.type;
		this.uri = entity.uri;
		this.retention.import(entity.retention);
	}
	public export(): EntryEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.type = this.type;
		entity.uri = this.uri;
		entity.retention = this.retention.export();
		return entity;
	}
	public get selected(): boolean {
		return this.css.selected();
	}
	public set selected(enabled: boolean) {
		this.css.selected(enabled);
	}
	public get closed(): boolean {
		return this.css.close();
	}
	public set closed(enabled: boolean) {
		this.css.close(enabled);
	}
	public visited() {
		this.retention.visited();
		this.upsert();
	}
	public stored() {
		this.retention.stored();
		this.upsert();
	}
	public bookmarked() {
		this.retention.bookmarked();
		this.upsert();
	}
}

export interface PostEntity extends EntryEntity {
	href: string;
	src: string;
	thumb?: string;
	text: string;
	date: string;
}

export class Post extends Entry {
	public href: string
	public src: string
	public thumb: string
	public text: string
	public date: string
	public constructor(entity: PostEntity) {
		super('post', entity.href);
		this.href = entity.href;
		this.src = entity.src;
		this.thumb = entity.thumb || ''; // FIXME
		this.text = entity.text;
		this.date = entity.date;
	}
	public import(entity: PostEntity) {
		super.import(entity);
		this.href = entity.href;
		this.src = entity.src;
		this.text = entity.text;
		this.date = entity.date;
	}
	public export(): PostEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.href = this.href;
		entity.src = this.src;
		entity.text = this.text;
		entity.date = this.date;
		return entity;
	}
	public get description(): string {
		return `${this.text} ${this.date}`;
	}
	public opened() {
		window.open(this.href); // XXX bad pure js
		this.visited();
	}
	public downloaded() {
		let dir = File.real(this.text);
		if (!File.valid(dir)) {
			dir = File.confirm(dir);
			if (!dir) {
				console.error(`invalid path characters. ${dir}`);
				return;
			}
		}
		File.save(this.href, dir);
		this.stored();
	}
}

export class EntryFactory {
	static create(entity: PostEntity): Entry {
		return new Post(entity);
	}
}
