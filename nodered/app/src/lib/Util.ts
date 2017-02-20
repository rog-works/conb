export default class Util {
	public static extend(dist: any, src: any): any {
		if (!Array.isArray(src) && src && typeof src === 'object') {
			for (const key in src) {
				if ((key in dist) && !Array.isArray(dist[key]) && dist[key] && typeof dist[key] === 'object') {
					dist[key] = Util.extend(dist[key], src[key]);
				} else {
					dist[key] = src[key];
				}
			}
		} else {
			throw new Error(`Invalid arguments. ${src}`);
		}
		return dist;
	}
	public static createObject(route: string, value: any): any {
		let json = JSON.stringify(value);
		for (const key of route.split('.').reverse()) {
			json = `{"${key}":${json}}`;
		}
		return JSON.parse(json);
	}
	public static evaluate<T>(context: any, script: string): T {
		return eval(`(function f($){ return ${script}; })`)(context);
	}
}
