import * as ko from 'knockout';
import DAO from '../lib/DAO';
import {Model, ModelEntity} from './Model';
import ModelFactory from './ModelFactory';
import {default as Entry, EntryEntity} from './Entry';
import {default as File, FileEntity} from './File';

export interface FilesEntity extends ModelEntity {
	entries: EntryEntity[]
}

class States {
	public static Loading: string = 'loading'
	public static Closed: string = 'closed'
	public static Opened: string = 'opened'
}

export default class Files extends Model { // XXX Posts???
	public readonly entries: KnockoutObservableArray<Entry>
	public readonly state: KnockoutObservable<string>
	public constructor(entity: FilesEntity) {
		super(['update', 'delete']);
		this.entries = ko.observableArray([]);
		this.state = ko.observable(States.Closed);
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
		this.state(States.Loading);
		this.import(await DAO.self.get<FilesEntity>('posts/show', { uri: uri })); // XXX unmatch resource name
		this.state(States.Opened);
	}
	public downloaded(): void {
		for (const entry of this.entries()) {
			const file = entry.getAttr<File>('file');
			if (!file.store()) {
				file.downloaded(entry.uri); // XXX uri is not endpoint
			}
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
