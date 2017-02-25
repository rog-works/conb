import * as ko from 'knockout-es5';
import Input from '../components/Input';
import {Model, ModelEntity} from './Model';
import {default as Tag, TagEntity} from './Tag';

export interface TagsEntity extends ModelEntity {
	tags: TagEntity[]
}

export default class Tags extends Model {
	public readonly tags: Tag[]
	public readonly input: Input // XXX component...
	public constructor(entity: TagsEntity) {
		super(['update', 'delete']);
		this.tags = [];
		for (const tagEntity of entity.tags) {
			this.add(new Tag(tagEntity));
		}
		this.input = new Input().on('accept', this._onAccept.bind(this));
		ko.track(this, ['tags']);
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: TagsEntity): void {
		super.import(entity);
		const before = this.tags.length;
		for (const tagEntity of entity.tags) {
			this.add(new Tag(tagEntity));
		}
		if (before < this.tags.length) {
			this.emit('update', this);
		}
	}
	// @override
	public export(): TagsEntity {
		const entity = <any>super.export(); // XXX down cast...
		entity.tags = this.tags.map(tag => tag.export());
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
		return this.tags.filter(tag => tag.name === tagName).length > 0;
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
	private _onAccept(sender: Input): boolean {
		this.tagged(this.input.value);
		this.input.value = '';
		return true;
	}
}
