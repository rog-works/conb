import DAO from '../lib/DAO';

export interface Serializer {
	import(entity: any): void
	export(): any
}

export interface ModelEntity {
	_id: string
}

export class Model implements Serializer {
	public constructor(
		private _id: string = ''
	) {}
	public import(entity: ModelEntity): void {
		this._id = entity._id;
	}
	public export(): ModelEntity {
		return { _id: this._id };
	}
	public get uniqueKey(): string {
		return '_id';
	}
	public get unique(): any {
		return this._id;
	}
	public get resource(): string {
		return (<any>this).constructor.name.toLowerCase(); // XXX any???
	}
	public get exists(): boolean {
		return this._id !== '';
	}
	public get(): Promise.IThenable<void> {
		return DAO.self.once(
				`${this.resource}/show`,
				{ [this.uniqueKey]: this.unique }
			)
			.then((entities: any[]) => {
				if (entities.length > 0) {
					this.import(entities[0]);
				}
			});
	}
	public find(where: any): Promise.IThenable<ModelEntity[]> {
		return DAO.self.once(
				`${this.resource}/index`,
				where
			);
	}
	public insert(): Promise.IThenable<void> {
		return DAO.self.once(
				`${this.resource}/create`,
				this.export()
			)
			.then((result: any) => this.get());
	}
	public update(): Promise.IThenable<void> {
		return DAO.self.once(
				`${this.resource}/edit`,
				this.export()
			)
			.then((result: any): void => {});
	}
	public upsert(): Promise.IThenable<void> {
		return this.exists ? this.update() : this.insert();
	}
}
