import {Model, ModelEntity} from './Model';
import StringUtil from '../utils/StringUtil';

interface ConstructorMap {
	[type: string]: ObjectConstructor
}

export default class ModelFactory {
	private static _self: ModelFactory
	private constructor(
		private _map: ConstructorMap = {}
	) {}
	public static get self(): ModelFactory {
		return ModelFactory._self || (ModelFactory._self = new ModelFactory());
	}
	public regist(construct: any): void {
		this._map[StringUtil.snakelize(construct.name)] = construct;
	}
	public create(entity: ModelEntity): Model {
		if (entity.type in this._map) {
			return <Model>(new this._map[entity.type](entity));
		}
		throw new Error(`Unknown model. ${JSON.stringify(entity)}`);
	}
}
