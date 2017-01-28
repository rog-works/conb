import * as ko from 'knockout';
import Observer from '../lib/Observer';

export default class WebObserver extends Observer {
	private _stack: any
	public css: any
	public constructor() {
		super();
		this._stack = {};
		this.css = {
			'fa-check': ko.observable(true),
			'fa-refresh': ko.observable(false),
			'fa-spin': ko.observable(false)
		};
		this.on('update', this._onUpdate.bind(this));
	}
	public get connected(): boolean {
		return Object.keys(this._stack).length > 0;
	}
	private _stacked(digest: string) {
		this._stack[digest] = true;
	}
	private _unstacked(digest: string) {
		if (digest in this._stack) {
			delete this._stack[digest];
		} else {
			console.log(`unknown digest. ${digest}`);
		}
	}
	private _onUpdate(self: WebObserver, message: string) {
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
	}
	private _updateState(connected: boolean) {
		for (const key of Object.keys(this.css)) {
			this.css[key](false);
		}
		if (!connected) {
			this.css['fa-check'](true);
		} else {
			this.css['fa-refresh'](true);
			this.css['fa-spin'](true);
		}
	}
}
