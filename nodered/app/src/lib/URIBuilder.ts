import URI from './URI'

export interface URIEntity {
	scheme: string
	host: string
	path: string
	queries: string[]
}

export default class URIBuilder {
	public static create(entity: URIEntity, params: any): URI {
		const uri = [
			`${entity.scheme}://`,
			entity.host,
			URIBuilder._buildPath(entity.path, params),
			URIBuilder._buildQueries(entity.queries, params)
		].join('');
		return new URI(uri);
	}
	public static _buildPath(path: string, params: any): string {
		return URIBuilder._evaluete(params, path);
	}
	public static _buildQueries(queries: string[], params: any): string {
		const strings = [];
		for (const query of queries) {
			const result = URIBuilder._buildQuery(query, params);
			if (result.length > 0) {
				strings.push(result);
			}
		}
		return strings.length > 0 ? `?${strings.join('&')}` : '';
	}
	public static _buildQuery(query: string, params: any): string {
		const matches = query.match(/(.+)\s+as\s+([\w.]+)/);
		if (!matches || matches.length !== 3) {
			return '';
		}
		const value = matches[1];
		const as = matches[2];
		const result = URIBuilder._evaluete(params, value);
		return result.length > 0 ? `${as}=${result}` : '';
	}
	public static _evaluete(context: any, script: string): string {
		return eval(`(function f($){ return ${script}; })`)(context);
	}
}
