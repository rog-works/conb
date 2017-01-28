import * as ko from 'knockout';

export default class Logger {
	public lines: KnockoutObservableArray<string>
	private _log: Function
	private _error: Function
	constructor() {
		if (this.target) {
			this.bind();
		}
	}
	get target() {
		return /iphone|android/.test(navigator.userAgent.toLowerCase());
	}
	bind() {
		this.lines = ko.observableArray([]);
		this._log = console.log.bind(console);
		this._error = console.error.bind(console);
		console.log = this.log.bind(this);
		console.error = this.error.bind(this);
	}
	log(...args: Array<any>) {
		this._log(...args);
		for (const arg of args) {
			this.lines.push(JSON.stringify(arg));
		}
	}
	error(...args: Array<any>) {
		this._error(...args);
		for (const arg of args) {
			this.lines.push(JSON.stringify(arg));
		}
	}
	clear() {
		this.lines.removeAll();
	}
}
