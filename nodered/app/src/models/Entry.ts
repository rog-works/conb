import * as ko from 'knockout';
import Sign from '../lib/Sign';
import {Model, ModelEntity} from './Model';
import ModelFactory from './ModelFactory';

export interface EntryEntity extends ModelEntity {
	_id?: string
	signature?: string
	type: string
	uri: string
	attrs: ModelEntity[]
}

export default class Entry extends Model {
	public static RESOURCE_NAME: string = 'entries';
	public _id: string
	public readonly signature: string
	public readonly uri: string
	public readonly attrs: KnockoutObservableArray<Model>
	public readonly css: any // XXX
	public constructor(entity: EntryEntity) {
		super();
		this._id = entity._id || '';
		this.signature = Entry.sign(entity.uri);
		this.uri = entity.uri;
		this.attrs = ko.observableArray(entity.attrs.map((attrEntity) => this._createAttr(attrEntity)));
		this.css = {
			close: ko.observable(false),
			selected: ko.observable(false)
		};
	}
	// @override
	public static find(where: any = {}): Promise.IThenable<Entry[]> {
		return Model.find(Entry.RESOURCE_NAME, where)
			.then((entities: EntryEntity[]) => {
				const models: Model[] = [];
				for(const entity of entities) {
					models.push(<Model>ModelFactory.self.create(entity));
				}
				return models;
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
		const types = entity.attrs.map((attr: ModelEntity) => attr.type);
		for(const attrModel of this.attrs()) {
			if (types.indexOf(attrModel.type) === -1) {
				this.attrs.remove(attrModel);
			}
		}
		for(const attrEntity of entity.attrs) {
			const model = this.attrs().filter((model) => model.type === attrEntity.type).pop();
			if (model) {
				model.import(attrEntity);
			} else {
				this.attrs.push(this._createAttr(attrEntity));
			}
		}
	}
	// @override
	public export(): EntryEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.signature = this.signature;
		entity.type = this.type;
		entity.uri = this.uri;
		entity.attrs = [];
		this.attrs().forEach((attr) => {
			entity.attrs.push(attr.export());
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
