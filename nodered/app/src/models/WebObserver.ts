import * as ko from 'knockout-es5';
import Observer from '../lib/Observer';

export default class WebObserver extends Observer {
	private readonly _stack: any // XXX
	public readonly css: any // XXX
	public constructor() {
		super();
		this._stack = {};
		this.css = {
			'fa-check': true,
			'fa-refresh': false,
			'fa-spin': false
		};
		this.on('update', this._onUpdate.bind(this));
		ko.track(this.css);
	}
	public get connected(): boolean {
		return Object.keys(this._stack).length > 0;
	}
	private _stacked(digest: string): void {
		this._stack[digest] = true;
	}
	private _unstacked(digest: string): void {
		if (digest in this._stack) {
			delete this._stack[digest];
		} else {
			console.log(`unknown digest. ${digest}`);
		}
	}
	private _updateState(connected: boolean): void {
		for (const key of Object.keys(this.css)) {
			this.css[key] = false;
		}
		if (!connected) {
			this.css['fa-check'] = true;
		} else {
			this.css['fa-refresh'] = true;
			this.css['fa-spin'] = true;
		}
	}
	private _onUpdate(sender: any, message: string): boolean {
		const [tag, digest] = message.split(' ');
		switch(tag) {
		case 'begin':
			this._stacked(digest);
			break;
		case 'end':
			this._unstacked(digest);
			break;
		}
		this._updateState(this.connected);
		return true;
	}
}
