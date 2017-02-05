import * as ko from 'knockout';
import {Model, ModelEntity} from './Model';

export interface TagEntity extends ModelEntity {
	name: string
}

export default class Tag extends Model {
	public readonly name: string
	public constructor(entity: TagEntity) {
		super();
		this.name = entity.name;
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: TagEntity): void {
		super.import(entity);
	}
	// @override
	public export(): TagEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.name = this.name;
		return entity;
	}
}
