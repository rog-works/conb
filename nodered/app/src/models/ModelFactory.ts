import {ModelEntity} from './Model';

interface ConstructorMap {
	[type: string]: Function // FIXME actual constructor
}

export default class ModelFactory {
	private static _self: ModelFactory
	private constructor(
		private _map: ConstructorMap = {}
	) {}
	public static get self(): ModelFactory {
		return ModelFactory._self || (ModelFactory._self = new ModelFactory());
	}
	public regist(type: string, construct: Function): void {
		this._map[type] = construct;
	}
	public create(entity: ModelEntity): any {
		if (entity.type in this._map) {
			return new (<any>this._map[entity.type])(entity); // XXX any...
		}
		throw new Error(`Unknown model. ${JSON.stringify(entity)}`);
	}
	private static _camerize(str: string): string {
		return str.split('_').map((word) => `${word[0].toUpperCase()}${word.substr(1).toLowerCase()}`).join('');
	}
}
