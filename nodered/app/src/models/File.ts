import * as ko from 'knockout';
import DAO from '../lib/DAO';
import Path from '../lib/Path';
import {Model, ModelEntity} from './Model';

export interface FileEntity extends ModelEntity {
	path: string
	store?: boolean
	size?: number
	date?: string
}

export default class File extends Model {
	public readonly path: string
	public readonly store: KnockoutObservable<boolean>
	public readonly size: number
	public readonly date: string
	public constructor(entity: FileEntity) {
		super();
		this.path = entity.path;
		this.store = ko.observable(entity.store || false);
		this.size = entity.size || 0;
		this.date = entity.date || 'none';
	}
	public static save(url: string, dir: string): void {
		DAO.self.send('download', {
			url: url,
			path: `${Path.normalize(dir)}/`
		});
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: FileEntity): void {
		super.import(entity);
		this.store(entity.store || this.store());
	}
	// @override
	public export(): FileEntity {
		const entity = <any>super.export(); // XXX down cast...
		entity.name = this.name;
		return entity;
	}
	public get name() {
		return Path.filename(this.path);
	}
	public get dir() {
		return Path.dirname(this.path);
	}
	public async downloaded(uri: string): Promise<void> {
		const result = await DAO.self.get<boolean>(
			'download',
			{ uri: uri, path: this.path }
		);
		this.store(result);
	}
}
