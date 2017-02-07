import * as ko from 'knockout';
import DAO from '../lib/DAO';
import {Model, ModelEntity} from './Model';
import {default as File, FileEntity} from './File';

export interface FilesEntity extends ModelEntity {
	files: FileEntity[]
}

export default class Files extends Model {
	public readonly files: KnockoutObservableArray<File>
	public constructor(entity: FilesEntity) {
		super(['update', 'delete']);
		this.files = ko.observableArray([]);
		for (const fileEntity of entity.files) {
			this.add(new File(fileEntity));
		}
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: FilesEntity): void {
		super.import(entity);
		for (const fileEntity of entity.files) {
			this.add(new File(fileEntity));
		}
		this.emit('update', this);
	}
	// @override
	public export(): FilesEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.files = this.files().map((file) => file.export());
		return entity;
	}
	public loaded(uri: string): void {
		DAO.self.once('files/index', {})
			.then((entity: FilesEntity) => {
				this.import(entity);
			});
	}
	public downloaded(): void {
		for (const file of this.files()) {
			file.downloaded();
		}
	}
	public add(file: File): boolean {
		if (!this.contains(file.name)) {
			this.files.push(file);
			return true;
		}
		return false;
	}
	public contains(fileName: string): boolean {
		return this.files().filter((file) => file.name === fileName).length > 0;
	}
}
