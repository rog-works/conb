import * as ko from 'knockout';
import * as $ from 'jquery';
import DAO from '../lib/DAO';
import {Model, ModelEntity} from './Model';

export interface SiteEntity extends ModelEntity {
	uri: string
	name: string
	query: string
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
		const matches = this.query.match(/^select\s+(.+)\s+from\s+[^\s]+/);
		const queries = matches ? matches[1] : '';
		return queries.split(',');
	}
	public get from(): string {
		const matches = this.query.match(/^select\s+.+\s+from\s+([^\s]+)/);
		return matches ? matches[1] : '';
	}
	public get where(): string {
		const matches = this.query.match(/^select\s+.+\s+from\s+[^\s]+where\s+(.+)/);
		return matches ? matches[1] : '';
	}
	public async loaded(): Promise<void> {
		(await Query.from(this.from))
			.where(this.where)
			.select(this.select);
	}
}

export class Query {
	public constructor(public e: JQuery) {}
	public static async from(from: string): Promise<Query> {
		const html = await DAO.self.get<string>(
			'html',
			{ url: from }
		);
		return new Query($(html));
	}
	public where(query: string): Query {
		return new Query(this.e.find(query));
	}
	public select(fieldOfQueries: string[]): any[] {
		const rows: any[] = [];
		this.e.each((elem) => {
			let row = {};
			for (const queries of fieldOfQueries) {
				row = $.extend(row, this._selectOne($(elem), queries));
			}
			rows.push(row);
		});
		return rows;
	}
	private _selectOne(e: JQuery, queries: string): {} {
		const matches = queries.match(/\$\("([^"]+)"\)\.([^(]+)\("([^"]+)"\) as ([\w.]+)/) || [];
		matches.shift();
		const query = matches.shift() || '';
		const verb = matches.shift() || '';
		const prop = matches.shift() || '';
		const as = matches.shift() || '';
		return { [as]: e.find(query)[verb](prop) };
	}
}
