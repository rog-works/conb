import * as ko from 'knockout';
import DAO from '../lib/DAO';
import {Model, ModelEntity} from './Model';

export interface FileEntity extends ModelEntity {
	path: string
	store: boolean
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
		this.store = ko.observable(entity.store);
		this.size = entity.size || 0;
		this.date = entity.date || 'none';''
	}
	public static real(path: string): string {
		return `images/${path}`; // XXX
	}
	public static confirm(dir: string): string {
		dir = prompt('input save dir', dir) || '';
		return File.valid(dir) ? dir : '';
	}
	public static valid(path: string): boolean {
		return !/[\\:*?"<>|]+/.test(path);
	}
	public static normalize(dir: string): string {
		return `${dir.split('/').join('/')}`;
	}
	public static save(url: string, dir: string): void {
		DAO.self.send('download', {
			url: url,
			path: `${File.normalize(dir)}/`
		});
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: FileEntity): void {
		super.import(entity);
		this.store(entity.store);
	}
	// @override
	public export(): FileEntity {
		const entity = <any>super.export(); // XXX down cast...
		entity.name = this.name;
		return entity;
	}
	public get name() {
		return this.path.split('/').pop() || ''; // XXX empty?
	}
	public get dir() {
		const route = this.path.split('/');
		route.pop();
		return route.join('/');
	}
	public async downloaded(uri: string) {
		const result = <boolean>await DAO.self.once('download', {
			url: uri,
			path: File.normalize(this.path)
		});
		this.store(result);
	}
}
