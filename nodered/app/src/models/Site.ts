import * as ko from 'knockout-es5';
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
	public constructor(
		public value: string
	) {
		ko.track(this);
	}
	public static toObjs(params: string[]): Param[] {
		return params.map(param => new this(param));
	}
	public static toValues(params: Param[]): string[] {
		return params.map(query => query.value);
	}
}

class From implements Serializer {
	public scheme: string
	public host: string
	public path: string
	public readonly queries: Param[]
	public constructor(entity: URIEntity) {
		this.scheme = entity.scheme;
		this.host = entity.host;
		this.path = entity.path;
		this.queries = Param.toObjs(entity.queries);
		ko.track(this);
	}
	// @override
	public import(entity: URIEntity): void {
	}
	// @override
	public export(): URIEntity {
		return {
			scheme: this.scheme,
			host: this.host,
			path: this.path,
			queries: Param.toValues(this.queries)
		};
	}
}

export default class Site extends Model {
	public name: string
	public readonly select: Param[]
	public readonly from: From
	public where: string
	public constructor(entity: SiteEntity) {
		super(['update', 'delete']);
		this.name = entity.name;
		this.select = Param.toObjs(entity.select);
		this.from = new From(entity.from);
		this.where = entity.where;
		ko.track(this);
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
		entity.name = this.name;
		entity.select = Param.toValues(this.select);
		entity.from = this.from.export();
		entity.where = this.where;
		return entity;
	}
	public get querify(): string {
		return `/sites/${this.name}`;
	}
	public get domain(): string {
		return this.from.host;
	}
	public async load<T extends ModelEntity>(params: any = {}): Promise<T[]> {
		const uri = URIBuilder.create(this.from.export(), params);
		return await Query.select(Param.toValues(this.select))
			.from(uri.full)
			.where(this.where)
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
