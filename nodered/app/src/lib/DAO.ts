import * as Promise from 'promise';
import WS from '../lib/WS';
import {EventHandler} from './EventEmitter';
import Sign from './Sign';

interface Resolver {
	then(resolve: Function, reject?: Function): any
}

export default class DAO {
	private static _self: DAO;
	private constructor(private _ws: WS) {
	}
	public static create(dsn: string): DAO {
		return DAO._self || (DAO._self = new DAO(new WS(dsn)));
	}
	public static get self(): DAO {
		return DAO._self;
	}
	public on(tag: string, callback: EventHandler): this {
		this._ws.on(tag, callback);
		return this;
	}
	public once(tag: string, data: any) {
		return new Promise((resolve: Function, reject: Function) => {
			const request = this._sign(tag, data);
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
	public many(tag: string, data: any): Resolver { // FIXME returned mock
		return {
			then: (resolve: EventHandler, reject?: Function) => {
				const request = this._sign(tag, data);
				this._ws.on('message', resolve);
				this._ws.send(request);
				console.log('many request', request);
			}
		};
	}
	public send(tag: string, data: any) {
		const request = this._sign(tag, data);
		this._ws.send(request);
		console.log('send', request);
	}
	private _sign(tag: string, data: any): any {
		const request = {
			route: tag,
			data: data,
			nance: new Date().getTime(),
			digest: ''
		};
		request.digest = Sign.digest(data);
		return request;
	}
}
