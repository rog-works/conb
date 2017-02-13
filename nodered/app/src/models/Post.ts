import * as ko from 'knockout';
import Path from '../lib/Path';
import {Model, ModelEntity} from './Model';
import File from './File';
import Image from './Image';

export interface PostEntity extends ModelEntity {
	href: string
	src: string
	text: string
	date: string
	visit?: boolean
	store?: boolean
	bookmark?: boolean
	favorite?: boolean
	site?: string
}

export default class Post extends Model {
	public readonly href: string
	public readonly text: string
	public readonly date: string
	public readonly visit: KnockoutObservable<boolean>
	public readonly store: KnockoutObservable<boolean>
	public readonly bookmark: KnockoutObservable<boolean>
	public readonly favorite: KnockoutObservable<boolean>
	public readonly image: Image
	public readonly site: string
	public constructor(entity: PostEntity) {
		super(['update', 'delete']);
		this.href = entity.href;
		this.text = entity.text;
		this.date = entity.date;
		this.visit = ko.observable(entity.visit || false);
		this.store = ko.observable(entity.store || false);
		this.bookmark = ko.observable(entity.bookmark || false);
		this.favorite = ko.observable(entity.favorite || false);
		this.image = new Image({ type: 'image', uri: entity.src }); // XXX
		this.site = entity.site || '';
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: PostEntity): void {
		super.import(entity);
		this.visit(entity.visit || this.visit());
		this.store(entity.store || this.store());
		this.bookmark(entity.bookmark || this.bookmark());
		this.favorite(entity.favorite || this.favorite());
	}
	// @override
	public export(): PostEntity {
		const entity = <any>super.export(); // XXX down cast...
		entity.href = this.href;
		entity.src = this.image.uri;
		entity.text = this.text;
		entity.date = this.date;
		entity.visit = this.visit();
		entity.store = this.store();
		entity.bookmark = this.bookmark();
		entity.favorite = this.favorite();
		entity.site = this.site;
		return entity;
	}
	public get domain(): string {
		const matches = this.href.match(/^[\w]+:\/\/([^\/]+)/);
		return matches ? matches[1] : 'localhost';
	}
	public opened() {
		window.open(this.href); // XXX not pure js
		if (!this.visit()) {
			this.visit(true);
			this.emit('update', this);
		}
	}
	public downloaded() {
		let dir = Path.real(this.text);
		if (!Path.valid(dir)) {
			dir = Path.confirm(dir);
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
	public favorited() {
		this.favorite(!this.favorite());
		this.emit('update', this);
	}
	public stored() {
		this.store(!this.store());
		this.emit('update', this);
	}
	public unretentioned() { // XXX
		this.visit(false);
		this.store(false);
		this.bookmark(false);
		this.favorite(false);
		this.emit('delete', this);
	}
}
