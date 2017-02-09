import * as ko from 'knockout';
import DAO from '../lib/DAO';
import {Model, ModelEntity} from './Model';
import ModelFactory from './ModelFactory';
import {default as Entry, EntryEntity} from './Entry';
import {default as File, FileEntity} from './File';

export interface FilesEntity extends ModelEntity {
	entries: EntryEntity[]
}

export default class Files extends Model {
	public readonly entries: KnockoutObservableArray<Entry>
	public constructor(entity: FilesEntity) {
		super(['update', 'delete']);
		this.entries = ko.observableArray([]);
		for (const entryEntity of entity.entries) {
			this.add(ModelFactory.self.create<Entry>(entryEntity));
		}
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: FilesEntity): void {
		super.import(entity);
		for (const entryEntity of entity.entries) {
			this.add(ModelFactory.self.create<Entry>(entryEntity));
		}
		this.emit('update', this);
	}
	// @override
	public export(): FilesEntity {
		const entity = <any>super.export(); // XXX down cast...
		entity.entries = this.entries().map((entry) => entry.export());
		return entity;
	}
	public async loaded(uri: string): Promise<void> {
		const ret = await DAO.self.once('posts/show', { uri: uri });
	}
	public downloaded(): void {
		for (const entry of this.entries()) {
			entry.getAttr<File>('file').downloaded(entry.uri);
		}
	}
	public add(entry: Entry): boolean {
		if (entry.hasAttr('file')) {
			this.entries.push(entry);
			return true;
		}
		return false;
	}
}
