import * as ko from 'knockout';
import * as $ from 'jquery';
import DAO from '../lib/DAO';
import Query from '../lib/Query';
import {Model, ModelEntity} from './Model';

export interface SiteEntity extends ModelEntity {
	name?: string
	select?: string[]
	from: string
	where?: string
}

export default class Site extends Model {
	public readonly name: KnockoutObservable<string>
	public readonly select: KnockoutObservableArray<string>
	public readonly from: KnockoutObservable<string>
	public readonly where: KnockoutObservable<string>
	public constructor(entity: SiteEntity) {
		super(['update', 'delete']);
		this.name = ko.observable(entity.name || '');
		this.select = ko.observableArray(entity.select || []);
		this.from = ko.observable(entity.from);
		this.where = ko.observable(entity.where || '');
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: SiteEntity): void {
		super.import(entity);
	}
	// @override
	public export(): SiteEntity {
		const entity = <any>super.export(); // XXX down cast...
		entity.name = this.name();
		entity.select = this.select();
		entity.from = this.from();
		entity.where = this.where();
		return entity;
	}
	public get querify(): string {
		return `sites/${this.name}`;
	}
	public get domain(): string { // XXX copied via Post
		const matches = this.from().match(/^[\w]+:\/\/([^\/]+)/);
		return matches ? matches[1] : 'localhost';
	}
	public async load<T extends ModelEntity>(params: any = {}): Promise<T[]> {
		const from = this._inject(this.from(), params);
		const html = await Query.from(from);
		return html.where(this.where()).select(this.select());
	}
	private _inject(from: string, params: any): string {
		for (const key in Object.keys(params)) {
			from = from.replace(`{${key}}`, params[key]);
		}
		return from;
	}
	public saved(): void {
		this.emit('update', this);
	}
	public deleted(): void {
		this.emit('delete', this);
	}
	public addedSelect(): void {
		const select = prompt('added select');
		if (select) {
			this.select.push(select);
		}
	}
}
