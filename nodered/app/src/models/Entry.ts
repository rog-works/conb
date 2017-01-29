import * as ko from 'knockout';
import Sign from '../lib/Sign';
import {Model, ModelEntity} from './Model';
import ModelFactory from './ModelFactory';

export interface EntryEntity extends ModelEntity {
	_id?: string
	signature: string
	type: string
	uri: string
	attrs: ModelEntity[]
}

export default class Entry extends Model {
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
		this.attrs = ko.observableArray(entity.attrs.map((attr) => {
			const model = ModelFactory.self.create(attr);
			model.on('update', this.tracking.bind(this));
			return model;
		}));
		this.css = {
			close: ko.observable(false),
			selected: ko.observable(false)
		};
		this.get(); // XXX
	}
	public static sign(uri: string): string {
		return Sign.digest(uri);
	}
	public get description(): string {
		return JSON.stringify(this.export()); // XXX
	}
	// @override
	public get uniqueKey(): string {
		return 'signature';
	}
	// @override
	public get resource(): string {
		return 'entries';
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
		for(const model of this.attrs()) {
			if (types.indexOf(model.type) === -1) {
				this.attrs.remove(model);
			}
		}
		for(const attr of entity.attrs) {
			const model = this.attrs().filter((model) => model.type === attr.type).pop();
			if (model) {
				model.import(attr);
			} else {
				const model = ModelFactory.self.create(attr); // XXX copy & past
				model.on('update', this.tracking.bind(this));
				this.attrs.push(model);
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
	public tracking(sender: Model) {
		console.log('tracking update', sender);
		this.upsert();
	}
}
