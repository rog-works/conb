import * as ko from 'knockout';
import * as $ from 'jquery';
import DAO from '../lib/DAO';
import Query from '../lib/Query';
import {Model, ModelEntity} from './Model';

export interface SiteEntity extends ModelEntity {
	uri: string
	name: string
	query: string
}

enum Queries {
	Select = 1,
	From = 2,
	Where = 3
}

export default class Site extends Model {
	public readonly uri: string
	public readonly name: string
	public readonly query: string
	public constructor(entity: SiteEntity) {
		super(['update', 'delete']);
		this.uri = entity.uri;
		this.name = entity.name;
		this.query = entity.query;
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
		entity.uri = this.uri;
		entity.name = this.name;
		entity.query = this.query;
		return entity;
	}
	public get select(): string[] {
		const matches = Query.parse(this.query);
		const queries = matches ? matches[Queries.Select] : '';
		return queries.split(', '); // XXX
	}
	public get from(): string {
		const matches = Query.parse(this.query);
		return matches ? matches[Queries.From] : '';
	}
	public get where(): string {
		const matches = Query.parse(this.query);
		return matches ? matches[Queries.Where] : '';
	}
	public async loaded(page: number): Promise<any[]> {
		const html = await Query.from(this.from.replace('{page}', `${page}`)); // XXX to query page arg
		const rows = html.where(this.where).select(this.select);
		console.log(rows);
		return rows;
	}
}
