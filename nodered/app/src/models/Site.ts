import * as ko from 'knockout';
import DAO from '../lib/DAO';
import Query from '../lib/Query';
import {default as URIBuilder, URIEntity} from '../lib/URIBuilder';
import {Model, ModelEntity, Serializer} from './Model';

export interface SiteEntity extends ModelEntity {
	name: string
	select: string[]
	from: URIEntity
	where: string
}

class Param {
	public readonly value: KnockoutObservable<string>
	public constructor(value: string) {
		this.value = ko.observable(value);
	}
	public static deserialize(params: string[]): Param[] {
		return params.map(param => new this(param));
	}
	public static serialize(params: Param[]): string[] {
		return params.map(query => query.value());
	}
}

class From implements Serializer {
	public readonly scheme: KnockoutObservable<string>
	public readonly host: KnockoutObservable<string>
	public readonly path: KnockoutObservable<string>
	public readonly queries: KnockoutObservableArray<Param>
	public constructor(entity: URIEntity) {
		this.scheme = ko.observable(entity.scheme);
		this.host = ko.observable(entity.host);
		this.path = ko.observable(entity.path);
		this.queries = ko.observableArray(Param.deserialize(entity.queries));
	}
	// @override
	public import(entity: URIEntity): void {
	}
	// @override
	public export(): URIEntity {
		return {
			scheme: this.scheme(),
			host: this.host(),
			path: this.path(),
			queries: Param.serialize(this.queries())
		};
	}
}

export default class Site extends Model {
	public readonly name: KnockoutObservable<string>
	public readonly select: KnockoutObservableArray<Param>
	public readonly from: From
	public readonly where: KnockoutObservable<string>
	public constructor(entity: SiteEntity) {
		super(['update', 'delete']);
		this.name = ko.observable(entity.name);
		this.select = ko.observableArray(Param.deserialize(entity.select));
		this.from = new From(entity.from);
		this.where = ko.observable(entity.where);
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
		entity.select = Param.serialize(this.select());
		entity.from = this.from.export();
		entity.where = this.where();
		return entity;
	}
	public get querify(): string {
		return `/sites/${this.name()}`;
	}
	public get domain(): string {
		return this.from.host();
	}
	public async load<T extends ModelEntity>(params: any = {}): Promise<T[]> {
		const uri = URIBuilder.create(this.from.export(), params);
		return await Query.select(Param.serialize(this.select()))
			.from(uri.full)
			.where(this.where())
			.async<T>();
	}
	public saved(): void {
		this.emit('update', this);
	}
	public deleted(): void {
		this.emit('delete', this);
	}
	public addedSelect(): void {
		this.select.push(new Param('"" as empty'));
	}
	public addedQuery(): void {
		this.from.queries.push(new Param('"" as empty'));
	}
	public removedQuery(query: Param): void {
		this.from.queries.remove(query);
	}
}
