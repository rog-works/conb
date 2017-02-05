import * as ko from 'knockout';
import Input from '../components/Input';
import {Model, ModelEntity} from './Model';
import {default as Tag, TagEntity} from './Tag';

export interface TagsEntity extends ModelEntity {
	tags: TagEntity[]
}

export default class Tags extends Model {
	public readonly tags: KnockoutObservableArray<Tag>
	public readonly input: Input // XXX component...
	public constructor(entity: TagsEntity) {
		super(['update', 'delete']);
		this.tags = ko.observableArray([]);
		for (const tagEntity of entity.tags) {
			this.add(new Tag(tagEntity));
		}
		this.input = new Input('').on('accept', this._onAccept.bind(this));
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: TagsEntity): void {
		super.import(entity);
		for (const tagEntity of entity.tags) {
			this.add(new Tag(tagEntity));
		}
		this.emit('update', this);
	}
	// @override
	public export(): TagsEntity {
		const entity = <any>super.export(); // FIXME down cast...
		entity.tags = this.tags().map((tag) => tag.export());
		return entity;
	}
	public add(tag: Tag): boolean {
		if (!this.contains(tag.name)) {
			this.tags.push(tag);
			return true;
		}
		return false;
	}
	public contains(tagName: string): boolean {
		return this.tags().filter((tag) => tag.name === tagName).length > 0;
	}
	public tagged(tagName: string): void {
		const tag = new Tag({
			type: 'tag', // XXX
			name: tagName
		});
		if (this.add(tag)) {
			this.emit('update', this);
		}
	}
	public untagged(tag: Tag): void {
		if (this.tags.remove(tag)) {
			this.emit('update', this);
		}
	}
	private _onAccept(sender: Input) {
		this.tagged(this.input.value());
	}
}
