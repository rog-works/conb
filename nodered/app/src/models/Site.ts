import * as ko from 'knockout';

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
		const matches = this.query.match(/^select\s+(.+)\s+from/);
		const queries = matches ? matches[1] : '';
		return queries.split(',');
	}
	public get from(): string {
		const matches = this.query.match(/^select\s+.+\s+from\s+([^\s]+)\s+where/);
		return matches ? matches[1] : '';
	}
	public get where(): string {
		const matches = this.query.match(/^select\s+.+\s+from\s+[^\s]+where\s+(.+)/);
		return matches ? matches[1] : '';
	}
	public async loaded(page: number): Promise<any[]> {
		return (await Query.from(this.from.replace('{page}', `${page}`))) // XXX to query page arg
			.where(this.where)
			.select(this.select);
	}
}

export class Query {
	public constructor(public e: JQuery) {}
	public static async from(from: string): Promise<Query> {console.log(0);
		const html = await DAO.self.get<string>(
			'html',
			{ url: from }
		);console.log(1, $);
		return new Query($(html));
	}
	public where(query: string): Query {console.log(2);
		return new Query(this.e.find(query));
	}
	public select(fieldOfQueries: string[]): any[] {console.log(3);
		const rows: any[] = [];console.log(this.e);
		this.e.each((elem) => {console.log(4);
			let row = {};
			for (const queries of fieldOfQueries) {console.log(5);
				row = $.extend(row, this._selectOne($(elem), queries));
			}
			rows.push(row);
		});console.log(6);
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
