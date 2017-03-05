import Util from '../utils/Util';

export class DI {
	private static _self: DI
	private _definitions: any
	private constructor() {
		this._definitions = {
			// ['buttons/post/bookmark']: {
			// 	construct: Button,
			// 	params: {
			// 		type: 'button',
			// 		icon: 'fa-bookmark',
			// 		click: { call: 'bookmarked' },
			// 		transit: { script: '$.bookmark === true' } // FIXME no tracking
			// 	}
			// }
		};
	}
	public static get self(): DI {
		return DI._self || (DI._self = new DI());
	}
	public resolve<T extends Object>(route: string, context: any): T {
		if (!(route in this._definitions)) {
			throw new Error(`Unknown route. ${route}`);
		}
		const definition = this._definitions[route];
		const dependencies = DI._resolveDependencies(definition.params, context);
		// return new definition.construct(dependencies);
		return dependencies;
	}
	private static _resolveDependencies(params: any, context: any): any {
		const entity: any = {};
		for (const key in params) {
			const value = params[key];
			if (value && typeof value === 'object') {
				if ('call' in value) {
					entity[key] = context[value.call].bind(context);
				} else if ('script' in value) {
					entity[key] = () => { return Util.evaluate(context, value.script); };
				}
			} else {
				entity[key] = value;
			}
		}
		return entity;
	}
}
