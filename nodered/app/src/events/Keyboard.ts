import EventEmitter from '../lib/EventEmitter';

export default class Keyboard extends EventEmitter {
	private static _self: Keyboard
	private constructor() {
		super('keypress', 'keydown', 'keyup');
	}
	public static get self(): Keyboard {
		return this._self || (this._self = new Keyboard());
	}
	public onKeypress(sender: any, event: KeyboardEvent): void {
		this.emit('keypress', sender, event);
	}
	public onKeydown(sender: any, event: KeyboardEvent): void {
		this.emit('keydown', sender, event);
	}
	public onKeyup(sender: any, event: KeyboardEvent): void {
		this.emit('keyup', sender, event);
	}
}