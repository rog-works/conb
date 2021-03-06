import WS from './WS';
import {EventHandler} from './EventEmitter';
import Sign from './Sign';

interface RequestEntity {
	route: string
	data: any
	nance: number
	digest: string
}

export default class DAO {
	private static _self: DAO
	private constructor(private _ws: WS) {}
	public static create(dsn: string): DAO {
		return DAO._self || (DAO._self = new DAO(new WS(dsn)));
	}
	public static get self(): DAO {
		return DAO._self;
	}
	// @override
	public on(tag: string, callback: EventHandler): this {
		this._ws.on(tag, callback);
		return this;
	}
	private _sign(route: string, data: any): RequestEntity {
		const request = {
			route: route,
			data: data,
			nance: new Date().getTime(),
			digest: ''
		};
		request.digest = Sign.digest(data);
		return request;
	}
	public once(route: string, data: any): Promise<any> {
		return new Promise((resolve: Function, reject: Function) => {
			const request = this._sign(route, data);
			const callback = (self: any, message: MessageEvent): boolean => {
				const response = JSON.parse(message.data);
				if (response.digest === request.digest) {
					console.log('once respond', response);
					this._ws.off('message', callback);
					return resolve(response.data);
				}
				return true;
			};
			this._ws.on('message', callback);
			this._ws.send(request);
			console.log('once request', request);
		});
	}
	public send(route: string, data: any): void {
		const request = this._sign(route, data);
		this._ws.send(request);
		console.log('send', request);
	}
	public async get<T>(route: string, data: any): Promise<T> {
		return await this.once(route, data);
	}
}
