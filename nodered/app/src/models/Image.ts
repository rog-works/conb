import * as ko from 'knockout-es5';
import DAO from '../lib/DAO';
import {Model, ModelEntity} from './Model';

export interface ImageEntity extends ModelEntity {
	uri: string
}

export default class Image extends Model {
	public readonly uri: string
	public src: string
	public constructor(entity: ImageEntity) {
		super();
		this.uri = entity.uri;
		this.src = '';
		if (this._canLoad(this.uri)) {
			this._load(this._parseUri(this.uri));
		} else {
			this.src = this.uri;
		}
		ko.track(this, ['src']);
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
	private async _load([route, url]: [string, string]): Promise<void> {
		const data = await DAO.self.get<{ src: string }>(route, { url: url });
		this.src = data.src;
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: ImageEntity) {
		super.import(entity);
	}
	// @override
	public export(): ImageEntity {
		const entity = <any>super.export(); // XXX down cast...
		entity.uri = this.uri;
		return entity;
	}
}
