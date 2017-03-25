import * as ko from 'knockout-es5';
import DAO from '../lib/DAO';
import Path from '../lib/Path';
import {Model, ModelEntity} from './Model';

export interface FileEntity extends ModelEntity {
	path: string
	size?: number
	date?: string
	store?: boolean
}

class States {
	public static Reserved: string = 'reserved'
	public static Stored: string = 'stored'
	public static Failed: string = 'failed'
	public static Downloading: string = 'downloading'
}

export default class File extends Model {
	public readonly path: string
	public readonly size: number
	public readonly date: string
	public store: boolean
	public state: string
	public constructor(entity: FileEntity) {
		super(['update', 'delete']);
		this.path = entity.path;
		this.size = entity.size || 0;
		this.date = entity.date || 'none';
		this.store = entity.store || false;
		this.state = this.store ? States.Stored : States.Reserved;
		ko.track(this, ['store', 'state']);
	}
	public static save(url: string, dir: string): void {
		DAO.self.send('download', {
			url: url,
			dir: `${Path.normalize(dir)}/`,
			filename: Path.filename(url)
		});
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: FileEntity): void {
		super.import(entity);
		this.store = entity.store || this.store;
	}
	// @override
	public export(): FileEntity {
		const entity = <any>super.export(); // XXX down cast...
		entity.path = this.path;
		entity.store = this.store;
		return entity;
	}
	public get name() {
		return Path.filename(this.path);
	}
	public get dir() {
		return Path.dirname(this.path);
	}
	public async downloaded(url: string, dir: string): Promise<void> {
		this.state = States.Downloading;
		const stored = await DAO.self.get<boolean>(
			'download',
			{ url: url, dir: dir, filename: this.name }
		);
		this.store = stored;
		this.state = this.store ? States.Stored : States.Failed;
		this.emit('update', this);
	}
}
