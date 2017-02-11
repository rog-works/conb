import * as ko from 'knockout';
import DAO from '../lib/DAO';
import Path from '../lib/Path';
import {Model, ModelEntity} from './Model';
import ModelFactory from './ModelFactory';
import {default as Entry, EntryEntity} from './Entry';
import {default as File, FileEntity} from './File';
import {default as Post, PostEntity} from './Post'; // XXX bad dependency

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
	public readonly stores: KnockoutObservable<number>
	public readonly store: KnockoutComputed<boolean>
	public constructor(entity: FilesEntity) {
		super(['update', 'delete']);
		this.entries = ko.observableArray([]);
		this.state = ko.observable(entity.entries ? States.Opened : States.Closed);
		this.stores = ko.observable(0);
		this.store = ko.computed({ owner: this, read: this._computedStore });
		for (const entryEntity of entity.entries) {
			this.add(ModelFactory.self.create<Entry>(entryEntity));
		}
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: FilesEntity): void {
		super.import(entity);
		const before = this.entries().length;
		for (const entryEntity of entity.entries) {
			const entry = this.uriAt(entryEntity.uri);
			if (entry) {
				entry.import(entryEntity);
			} else {
				this.add(ModelFactory.self.create<Entry>(entryEntity));
			}
		}
		if (before < this.entries().length) {
			this.emit('update', this);
		}
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
	public downloaded(parent: Entry): void { // XXX bad dependency parent
		let dir = `${Path.real(parent.getAttr<Post>('post').text)}/`;
		if (!Path.valid(dir)) {
			dir = Path.confirm(dir);
			if (!dir) {
				console.log('save cancel');
				return;
			}
		}
		for (const entry of this.entries()) {
			const file = entry.getAttr<File>('file');
			if (!file.store()) {
				const post = entry.getAttr<Post>('post');
				file.downloaded(post.href, dir);
			}
		}
	}
	public uriAt(uri: string): Entry | undefined {
		return this.entries().filter(entry => entry.uri === uri).pop();
	}
	public add(entry: Entry): boolean {
		if (entry.hasAttr('file')) {
			entry.getAttr<File>('file').on('update', this._onUpdate.bind(this));
			this.entries.push(entry);
			return true;
		}
		return false;
	}
	private _onUpdate(sender: File): boolean {
		this.stores(this.entries().filter(entry => entry.getAttr<File>('file').store()).length);
		return true;
	}
	private _computedStore(): boolean {
		return this.entries() && this.stores() === this.entries().length;
	}
}
