import * as Promise from 'promise';
import * as ko from 'knockout';
import * as $ from 'jquery';
import DAO from '../lib/DAO';

export interface Serializer {
	import(entity: any): void
	export(): any
}

export interface ModelEntity {
	signature: string;
	_id: string;
}

export abstract class Model implements Serializer {
	public constructor(
		public signature: string,
		private _id: string = ''
	) {}
	public import(entity: ModelEntity): void {
		this.signature = entity.signature;
		this._id = entity._id;
	}
	public export(): ModelEntity {
		return {
			signature: this.signature,
			_id: this._id
		};
	}
	public get resource(): string {
		return (<any>this).constructor.name.toLowerCase(); // XXX any???
	}
	public get exists(): boolean {
		return this._id !== '';
	}
	public find() {
		return DAO.self.once(
				`${this.resource}/show`,
				{ signature: this.signature }
			)
			.then((entities: Array<any>) => {
				if (entities.length > 0) {
					this.import(entities[0]);
				}
			});
	}
	public insert() {
		return DAO.self.once(
				`${this.resource}/create`,
				this.export()
			)
			.then((result: any) => this.find());
	}
	public update() {
		return DAO.self.once(
				`${this.resource}/edit`,
				this.export()
			)
			.then((result: any) => true);
	}
	public upsert() {
		return this.exists ? this.update() : this.insert();
	}
}
