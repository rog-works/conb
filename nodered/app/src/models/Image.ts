import * as ko from 'knockout';
import DAO from '../lib/DAO';
import {Model, ModelEntity} from './Model';

export interface ImageEntity extends ModelEntity {
	uri: string
}

export default class Image extends Model {
	public readonly uri: string
	public src: KnockoutObservable<string>
	public constructor(entity: ImageEntity) {
		super();
		this.uri = entity.uri;
		this.src = ko.observable('');
		if (this._canLoad(this.uri)) {
			this._load(this._parseUri(this.uri));
		} else {
			this.src(this.uri);
		}
	}
	private _canLoad(uri: string): boolean {
		return /^images\/[^?]+[?].+$/.test(uri);
	}
	private _parseUri(uri: string): [string, string] {
		const parts = uri.split('?');
		const route = parts.shift() || '';
		const url = decodeURIComponent(parts.shift() || '');
		return [route, url];
	}
	private _load([route, url]: [string, string]): Promise.IThenable<void> {
		return DAO.self.once(route, { url: url })
			.then((data: { src: string }) => {
				this.src(data.src);
			});
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
		entity.uri = this.uri;
		return entity;
	}
}
