import * as ko from 'knockout';
import Sign from '../lib/Sign';
import {Model, ModelEntity} from './Model';
import ModelFactory from './ModelFactory';

interface ModelEntities {
	[key: string]: ModelEntity
}

interface Models {
	[key: string]: Model
}

export interface EntryEntity extends ModelEntity {
	_id?: string
	signature?: string
	type: string
	uri: string
	attrs: ModelEntities
}

export default class Entry extends Model {
	public static RESOURCE_NAME: string = 'entries';
	public _id: string
	public readonly signature: string
	public readonly uri: string
	private readonly _attrs: Models // XXX
	private readonly _attrKeys: KnockoutObservableArray<string> // XXX
	public readonly attrs: KnockoutComputed<Model[]>
	public readonly css: any // XXX
	public readonly focus: KnockoutObservable<string>
	public constructor(entity: EntryEntity) {
		super();
		this._id = entity._id || '';
		this.signature = Entry.sign(entity.uri);
		this.uri = entity.uri;
		this._attrs = {};
		this._attrKeys = ko.observableArray([]);
		this.attrs = ko.computed({ owner: this, read: this._computeAttrs }); // XXX
		this.focus = ko.observable('');
		this.css = {
			close: ko.observable(false),
			selected: ko.observable(false)
		};
		// init attributes
		for(const key of Object.keys(entity.attrs)) {
			this._addAttr(this._createAttr(entity.attrs[key]));
		}
		this.focus(this._attrKeys().length > 0 ? this._attrKeys()[0] : ''); // FIXME
	}
	// @override
	public static find(where: any = {}): Promise.IThenable<Entry[]> {
		return Model.find(Entry.RESOURCE_NAME, where)
			.then((entities: EntryEntity[]) => {
				return entities.map((entity) => <Entry>ModelFactory.self.create(entity));
			});
	}
	public static sign(uri: string): string {
		return Sign.digest(uri);
	}
	// @override
	public get uniqueKey(): string {
		return 'signature';
	}
	// @override
	public get resource(): string {
		return Entry.RESOURCE_NAME;
	}
	// @override
	public get exists(): boolean {
		return this._id !== '';
	}
	// @override
	public import(entity: EntryEntity): void {
		super.import(entity);
		this._id = entity._id || '';
		for(const key of Object.keys(entity.attrs)) {
			const attrEntity = entity.attrs[key];
			if (this.hasAttr(key)) {
				this._attrs[key].import(attrEntity);
			} else {
				this._addAttr(this._createAttr(attrEntity));
			}
		}
	}
	// @override
	public export(): EntryEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.signature = this.signature;
		entity.type = this.type;
		entity.uri = this.uri;
		entity.attrs = {};
		this.attrs().forEach((attr) => {
			entity.attrs[attr.type] = attr.export();
		});
		return entity;
	}
	public get description(): string {
		return JSON.stringify(this.export()); // XXX
	}
	public get selected(): boolean {
		return this.css.selected();
	}
	public set selected(enabled: boolean) {
		this.css.selected(enabled);
	}
	public get closed(): boolean {
		return this.css.close();
	}
	public set closed(enabled: boolean) {
		this.css.close(enabled);
	}
	public focused(attr: Model): void {
		this.focus(attr.type);
	}
	private _computeAttrs(): Model[] {
		return this._attrKeys().map((key) => this._attrs[key]);
	}
	public hasAttr(type: string): boolean {
		return type in this._attrs;
	}
	public getAttr(type: string): Model {
		return this._attrs[type]; // XXX returned nullable
	}
	private _addAttr(attr: Model): void {
		if (!this.hasAttr(attr.type)) {
			this._attrs[attr.type] = attr;
			this._attrKeys.push(attr.type);
		} else {
			throw new Error(`Aready exists attribute. ${JSON.stringify(attr)}`);
		}
	}
	private _createAttr(entity: ModelEntity): Model {
		return ModelFactory.self.create(entity)
			.on('update', this._onUpdate.bind(this))
			.on('delete', this._onDelete.bind(this));
	}
	private _onUpdate(sender: Model): boolean {
		console.log('tracking update', sender);
		this.upsert();
		return true;
	}
	private _onDelete(sender: Model): boolean {
		console.log('tracking delete', sender);
		this.delete();
		return true;
	}
}
