import * as ko from 'knockout';
import {Model, ModelEntity} from './Model';

export interface ImageEntity extends ModelEntity {
	url: string
	src?: string
}

export default class Image extends Model {
	public readonly url: string
	private _src: KnockoutObservable<string>
	public constructor(entity: ImageEntity) {
		super();
		this.url = entity.url;
		this._src = ko.observable(entity.src || '');
		if (/^images:/.test(this.url) && !this._src()) {
			this._load(this._loadUrl());
		}
	}
	private _loadUrl(url) {
		return url.substr('images://'.length);
	}
	private _load() {
		// todo
	}
	public get src(): string {
		return this._src;
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: ImageEntity) {
		super.import(entity);
	}
	// @override
	public export(): ImageEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.src = this.src;
		return entity;
	}
}
