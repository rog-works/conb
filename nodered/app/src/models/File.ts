import * as ko from 'knockout';
import DAO from '../lib/DAO';
import {Model, ModelEntity} from './Model';

export interface FileEntity extends ModelEntity {
	name: string
}

export default class File extends Model {
	public readonly name: string
	public constructor(entity: FileEntity) {
		super();
		this.name = entity.name;
	}
	public static real(path: string): string {
		return `images/${path}`;
	}
	public static confirm(dir: string): string {
		dir = prompt('input save dir', dir) || '';
		return File.valid(dir) ? dir : '';
	}
	public static valid(path: string): boolean {
		return !/[\\:*?"<>|]+/.test(path);
	}
	public static normalize(dir: string): string {
		return `${dir.split('/').join('/')}/`;
	}
	public static save(url: string, dir: string): void {
		DAO.self.send('download', {
			url: url,
			dir: File.normalize(dir)
		});
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: FileEntity): void {
		super.import(entity);
	}
	// @override
	public export(): FileEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.name = this.name;
		return entity;
	}
	public downloaded() {
		// File.save(this.name, this.dir);
	}
}
