import * as ko from 'knockout';
import {Model, ModelEntity} from './Model';
import File from './File';

export interface PostEntity extends ModelEntity {
	href: string
	src: string
	text: string
	date: string
	thumb?: string
	visit: boolean
	store: boolean
	bookmark: boolean
}

export default class Post extends Model {
	public readonly href: string
	public readonly src: string
	public readonly text: string
	public readonly date: string
	public thumb: string
	public visit: KnockoutObservable<boolean>
	public store: KnockoutObservable<boolean>
	public bookmark: KnockoutObservable<boolean>
	public constructor(entity: PostEntity) {
		super(['update']);
		this.href = entity.href;
		this.src = entity.src;
		this.text = entity.text;
		this.date = entity.date;
		this.thumb = entity.thumb || ''; // FIXME
		this.visit = ko.observable(false);
		this.store = ko.observable(false);
		this.bookmark = ko.observable(false);
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: PostEntity) {
		super.import(entity);
		this.visit(entity.visit || this.visit());
		this.store(entity.store || this.store());
		this.bookmark(entity.bookmark || this.bookmark());
	}
	// @override
	public export(): PostEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.href = this.href;
		entity.src = this.src;
		entity.text = this.text;
		entity.date = this.date;
		entity.visit = this.visit();
		entity.store = this.store();
		entity.bookmark = this.bookmark();
		return entity;
	}
	// @override
	public get description(): string {
		return `${this.text} ${this.date}`;
	}
	public opened() {
		window.open(this.href); // XXX not pure js
		this.visit(true);
		this.emit('update', this);
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
		this.store(true);
		this.emit('update', this);
	}
	public bookmarked() {
		this.bookmark(!this.bookmark());
		this.emit('update', this);
	}
}
