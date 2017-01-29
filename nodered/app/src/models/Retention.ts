import * as ko from 'knockout';
import {Model, ModelEntity} from './Model';

export interface RetentionEntity extends ModelEntity {
	visit: boolean
	store: boolean
	bookmark: boolean
}

export default class Retention extends Model {
	public visit: KnockoutObservable<boolean>
	public store: KnockoutObservable<boolean>
	public bookmark: KnockoutObservable<boolean>
	public constructor() {
		super();
		this.visit = ko.observable(false);
		this.store = ko.observable(false);
		this.bookmark = ko.observable(false);
	}
	// @override
	public get uniqueKey(): string { return ''; } // XXX
	// @override
	public import(entity: RetentionEntity): void {
		super.import(entity);
		this.visit(entity.visit || this.visit());
		this.store(entity.store || this.store());
		this.bookmark(entity.bookmark || this.bookmark());
	}
	// @override
	public export(): RetentionEntity {
		const entity = <any>super.export();
		entity.visit = this.visit();
		entity.store = this.store();
		entity.bookmark = this.bookmark();
		return entity;
	}
	public visited(): void {
		this.visit(true);
	}
	public stored(): void {
		this.store(true);
	}
	public bookmarked(): void {
		this.bookmark(!this.bookmark());
	}
}
