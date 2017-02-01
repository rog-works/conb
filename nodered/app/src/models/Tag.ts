import * as ko from 'knockout';
import {Model, ModelEntity} from './Model';
import ModelFactory from './ModelFactory';

export interface TagsEntity extends ModelEntity {
	tags: TagEntity[]
}

export interface TagEntity extends ModelEntity {
	name: string
}

export class Tags extends Model {
	public readonly tags: KnockoutObservableArray<Tag>
	public constructor() {
		super(['update']);
		this.tags = ko.observableArray([]);
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: TagsEntity): void {
		super.import(entity);
		for (const tagEntity of entity.tags) {
			this.tags.push(<Tag>ModelFactory.self.create(tagEntity));
		}
		this.emit('update', this);
	}
	// @override
	public export(): TagsEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.tags = this.tags().map((tag) => tag.export());
		return entity;
	}
	public contains(tagName: string): boolean {
		return this.tags().filter((tag) => tag.name === tagName).length > 0;
	}
	public tagged(tagName: string): void {
		if (this.contains(tagName)) {
			const entity = {
				type: 'tag', // XXX
				name: tagName
			};
			this.tags.push(new Tag(entity));
			this.emit('update', this); // XXX undefined event
		}
	}
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
