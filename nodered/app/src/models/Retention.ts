import * as ko from 'knockout';
import {Serializer} from './Model';

export interface RetentionEntity {
	visit: boolean
	store: boolean
	bookmark: boolean
}

export default class Retention implements Serializer {
	public visit: KnockoutObservable<boolean>
	public store: KnockoutObservable<boolean>
	public bookmark: KnockoutObservable<boolean>
	public constructor() {
		this.visit = ko.observable(false);
		this.store = ko.observable(false);
		this.bookmark = ko.observable(false);
	}
	public import(entity: RetentionEntity) {
		this.visit(entity.visit || this.visit());
		this.store(entity.store || this.store());
		this.bookmark(entity.bookmark || this.bookmark());
	}
	public export(): RetentionEntity {
		return {
			visit: this.visit(),
			store: this.store(),
			bookmark: this.bookmark()
		};
	}
	public visited() {
		this.visit(true);
	}
	public stored() {
		this.store(true);
	}
	public bookmarked() {
		this.bookmark(!this.bookmark());
	}
}
