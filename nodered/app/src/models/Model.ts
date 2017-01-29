import DAO from '../lib/DAO';
import EventEmitter from '../lib/EventEmitter';
import StringUtil from '../utils/StringUtil';

export interface Serializer {
	import(entity: any): void
	export(): any
}

export interface ModelEntity {
	type: string
}

export abstract class Model extends EventEmitter implements Serializer {
	public constructor(tags: string[] = []) {
		super(...tags);
	}
	public abstract get uniqueKey(): string
	public get unique(): any {
		return (<any>this)[this.uniqueKey]; // XXX any...
	}
	public get type(): string {
		return StringUtil.snakalize((<any>this).constructor.name); // XXX any???
	}
	public get resource(): string { 
		return this.type;
	}
	public get exists(): boolean {
		return this.unique;
	}
	public import(entity: ModelEntity): void {}
	public export(): ModelEntity {
		return { type: this.type };
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
