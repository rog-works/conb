import * as ko from 'knockout';
import {Model, ModelEntity} from './Model';
import File from './File';

export interface StoreEntity extends ModelEntity {
	href: string
	store?: boolean
}

export default class Post extends Model {
	public href: string
	public store: KnockoutObservable<boolean>
	public constructor(entity: StoreEntity) {
		super(['update']);
		this.href = entity.href;
		this.store = ko.observable(entity.store || false);
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: StoreEntity) {
		super.import(entity);
		this.href = entity.href;
		this.store(entity.store || this.store());
	}
	// @override
	public export(): StoreEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.href = this.href;
		entity.store = this.store();
		return entity;
	}
	public stored() {
		// TODO
		// let dir = File.real(this.text);
		// if (!File.valid(dir)) {
		// 	dir = File.confirm(dir);
		// 	if (!dir) {
		// 		console.error(`invalid path characters. ${dir}`);
		// 		return;
		// 	}
		// }
		// File.save(this.href, dir);
		// this.store(true);
		// this.emit('update', this);
	}
}
