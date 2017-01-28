import * as ko from 'knockout';
import Sign from '../lib/Sign';
import {Model, ModelEntity} from './Model';
import {default as Retention, RetentionEntity} from './Retention';
import File from './File';

export interface EntryEntity extends ModelEntity {
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
		super(Entry.sign(uri));
		this.type = type;
		this.uri = uri;
		this.retention = new Retention();
		this.css = {
			close: ko.observable(false),
			selected: ko.observable(false)
		};
		this.find(); // FIXME
	}
	public static sign(uri: string): string {
		return Sign.digest(uri);
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
