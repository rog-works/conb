import * as ko from 'knockout-es5';
import DAO from '../lib/DAO';
import Path from '../lib/Path';
import URI from '../lib/URI';
import {Model, ModelEntity} from './Model';
import ModelFactory from './ModelFactory';
import {default as Entry, EntryEntity} from './Entry';
import {default as File, FileEntity} from './File';
import {default as Post, PostEntity} from './Post'; // XXX bad dependency
import Site from './Site';

export interface FilesEntity extends ModelEntity {
	entries: EntryEntity[]
}

class States {
	public static Loading: string = 'loading'
	public static Closed: string = 'closed'
	public static Opened: string = 'opened'
}

export default class Files extends Model { // XXX Posts???
	public readonly entries: Entry[]
	public state: string
	public stores: number
	public store: KnockoutComputed<boolean>
	public constructor(entity: FilesEntity) {
		super(['update', 'delete']);
		this.entries = [];
		this.state = entity.entries ? States.Opened : States.Closed;
		this.stores = 0;
		ko.track(this);
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
		const before = this.entries.length;
		for (const entryEntity of entity.entries) {
			const entry = this.uriAt(entryEntity.uri);
			if (entry) {
				entry.import(entryEntity);
			} else {
				this.add(ModelFactory.self.create<Entry>(entryEntity));
			}
		}
		if (before < this.entries.length) {
			this.emit('update', this);
		}
	}
	// @override
	public export(): FilesEntity {
		const entity = <any>super.export(); // XXX down cast...
		entity.entries = this.entries.map(entry => entry.export());
		return entity;
	}
	public async loaded(url: string, sitePath: string): Promise<void> {
		this.state = States.Loading;
		const where = { ['attrs.site.name']: sitePath };
		const siteEntries = await Entry.find({
			where: where,
			skip: 0,
			limit: 1
		});
		if (!siteEntries || siteEntries.length === 0) {
			throw new Error(`Unknown site. ${url}`);
		}
		const uri = new URI(url);
		const site = siteEntries[0].getAttr<Site>('site');
		const postEntities = await site.load<PostEntity>(site.createUri({ path: uri.path }));
		for (const postEntity of postEntities) {
			const entity = {
				type: 'entry',
				uri: postEntity.href,
				attrs: {
					post: postEntity,
					file: {
						type: 'file',
						path: Path.filename(postEntity.href)
					}
				}
			};
			const entry = ModelFactory.self.create<Entry>(entity);
			this.entries.push(entry);
		}
		this.state = States.Opened;
		this.emit('update', this, postEntities);
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
		for (const entry of this.entries) {
			const file = entry.getAttr<File>('file');
			if (!file.store) {
				const post = entry.getAttr<Post>('post');
				file.downloaded(post.href, dir);
			}
		}
	}
	public uriAt(uri: string): Entry | null {
		return this.entries.filter(entry => entry.uri === uri).pop() || null;
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
		this.stores = this.entries.filter(entry => entry.getAttr<File>('file').store).length;
		return true;
	}
	private _computedStore(): boolean {
		return this.entries.length > 0 && this.stores === this.entries.length;
	}
}
