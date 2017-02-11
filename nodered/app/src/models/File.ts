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

class States {
	public static Reserved: string = 'reserved'
	public static Stored: string = 'stored'
	public static Failed: string = 'failed'
	public static Downloading: string = 'downloading'
}

export default class File extends Model {
	public readonly path: string
	public readonly store: KnockoutObservable<boolean>
	public readonly size: number
	public readonly date: string
	public readonly state: KnockoutObservable<string>
	public constructor(entity: FileEntity) {
		super(['update', 'delete']);
		this.path = entity.path;
		this.store = ko.observable(entity.store || false);
		this.size = entity.size || 0;
		this.date = entity.date || 'none';
		this.state = ko.observable(this.store() ? States.Stored : States.Reserved);
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
	public async downloaded(uri: string, dir: string): Promise<void> {
		this.state(States.Downloading);
		const result = await DAO.self.get<boolean>(
			'download',
			{ uri: uri, dir: dir, filename: this.name }
		);
		this.store(result);
		this.state(this.store() ? States.Stored : States.Failed);
		this.emit('update', this);
	}
}
