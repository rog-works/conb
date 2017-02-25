import * as ko from 'knockout-es5';

export default class Logger {
	public constructor(
		public lines: string[] = [],
		private _log: Function = () => {},
		private _error: Function = () => {}
	) {
		if (this.target) {
			this.bind();
		}
		ko.track(this, ['lines']);
	}
	public get target(): boolean {
		return /iphone|android/.test(navigator.userAgent.toLowerCase()); // XXX not pure js
	}
	public bind(): void {
		this.lines = [];
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
