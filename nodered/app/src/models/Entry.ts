import * as ko from 'knockout';
import Sign from '../lib/Sign';
import {default as Model, ModelEntity} from './Model';
import ModelFactory from './ModelFactory';
import {default as Retention, RetentionEntity} from './Retention';
import File from './File';

export interface EntryEntity extends ModelEntity {
	signature: string
	type: string
	uri: string
	attrs: ModelEntity[]
}

export abstract class Entry extends Model {
	public readonly signature: string
	public readonly uri: string
	public readonly css: any // XXX
	public attrs: KnockoutObservableArray<Model>
	public constructor(type: string, uri: string) {
		super(type);
		this.signature = Entry.sign(uri);
		this.uri = uri;
		this.css = {
			close: ko.observable(false),
			selected: ko.observable(false)
		};
		this.attrs = ko.observableArray([new Retention()]);
		this.get(); // XXX
	}
	public static sign(uri: string): string {
		return Sign.digest(uri);
	}
	abstract get description(): string
	// @override
	public get uniqueKey(): string {
		return 'signature';
	}
	// @override
	public get unique(): string {
		return this.signature;
	}
	// @override
	public get resource(): string {
		return 'entries';
	}
	public get retention(): Retention {
		return <Retention>this.attrs()[0];
	}
	public import(entity: EntryEntity): void {
		super.import(entity);
		const types = entity.attrs.map((attr: ModelEntity) => attr.type);
		this.attrs().forEach((attr) => {
			if (types.indexOf(attr.type) === -1) {
				this.attrs.remove(attr);
			}
		});
		entity.attrs.forEach((attr) => {
			for (const model of this.attrs()) {
				if (model.type === attr.type) {
					model.import(attr);
					return;
				}
			}
			this.attrs.push(ModelFactory.self.create(attr));
		});
	}
	public export(): EntryEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.signature = this.signature;
		entity.type = this.type;
		entity.uri = this.uri;
		entity.attrs = [];
		this.attrs().forEach((attr) => {
			entity.attrs.push(attr.export());
		});
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
	public visited(): void {
		this.retention.visited();
		this.upsert();
	}
	public stored(): void {
		this.retention.stored();
		this.upsert();
	}
	public bookmarked(): void {
		this.retention.bookmarked();
		this.upsert();
	}
}

export interface PostEntity extends EntryEntity {
	href: string
	src: string
	text: string
	date: string
	thumb?: string
}

export class Post extends Entry {
	public readonly href: string
	public readonly src: string
	public readonly text: string
	public readonly date: string
	public thumb: string
	public constructor(entity: PostEntity) {
		super('post', entity.href);
		this.href = entity.href;
		this.src = entity.src;
		this.text = entity.text;
		this.date = entity.date;
		this.thumb = entity.thumb || ''; // FIXME
	}
	public import(entity: PostEntity) {
		super.import(entity);
	}
	public export(): PostEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.href = this.href;
		entity.src = this.src;
		entity.text = this.text;
		entity.date = this.date;
		return entity;
	}
	// @override
	public get description(): string {
		return `${this.text} ${this.date}`;
	}
	public opened() {
		window.open(this.href); // XXX not pure js
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
