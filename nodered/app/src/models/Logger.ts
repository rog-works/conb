import * as ko from 'knockout';

export default class Logger {
	public lines: KnockoutObservableArray<string>
	private _log: Function
	private _error: Function
	public constructor() {
		if (this.target) {
			this.bind();
		}
	}
	public get target(): boolean {
		return /iphone|android/.test(navigator.userAgent.toLowerCase());
	}
	public bind(): void {
		this.lines = ko.observableArray([]);
		this._log = console.log.bind(console);
		this._error = console.error.bind(console);
		console.log = this.log.bind(this);
		console.error = this.error.bind(this);
	}
	public log(...args: any[]): void {
		this._log(...args);
		for (const arg of args) {
			this.lines.push(JSON.stringify(arg));
		}
	}
	public error(...args: any[]): void {
		this._error(...args);
		for (const arg of args) {
			this.lines.push(JSON.stringify(arg));
		}
	}
	public clear(): void {
		this.lines.removeAll();
	}
}
