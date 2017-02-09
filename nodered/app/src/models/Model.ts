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
		return StringUtil.snakelize((<any>this).constructor.name); // XXX any???
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
	public static async find(resource: string, where: any = {}): Promise<ModelEntity[]> {
		return await DAO.self.get<ModelEntity[]>(
				`${resource}/index`,
				where
			);
	}
	public async get(): Promise<void> {
		const entities = await DAO.self.get<ModelEntity[]>(
			`${this.resource}/show`,
			{ [this.uniqueKey]: this.unique }
		);
		if (entities.length > 0) {
			this.import(entities[0]);
		}
	}
	public async insert(): Promise<void> {
		await DAO.self.get<boolean>(
			`${this.resource}/create`,
			this.export()
		);
		this.get();
	}
	public async update(): Promise<void> {
		await DAO.self.get<boolean>(
			`${this.resource}/edit`,
			this.export()
		);
	}
	public upsert(): Promise<void> {
		return this.exists ? this.update() : this.insert();
	}
	public async delete(): Promise<void> {
		await DAO.self.get<boolean>(
			`${this.resource}/destroy`,
			{ [this.uniqueKey]: this.unique }
		);
	}
}
