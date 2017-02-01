import * as ko from 'knockout';
import EventEmitter from '../lib/EventEmitter';

export enum KeyCodes {
	Enter = 13,
	Esc = 27,
	Left = 37,
	Up = 38,
	Right = 39,
	Down = 40,
	F = 70
}

export default class Input extends EventEmitter {
	public value: KnockoutObservable<string>
	public focus: KnockoutObservable<boolean>
	public constructor(value: string) {
		super('focus', 'accept', 'cancel', 'keyup');
		this.value = ko.observable(value);
		this.focus = ko.observable(false);
	}
	public get number(): number {
		return parseInt(this.value());
	}
	public set number(number: number) {
		this.value(`${number}`);
	}
	public onFocus(sender: any): boolean {
		this.emit('focus', sender);
		return true;
	}
	public onKeyup(sender: any, event: KeyboardEvent): boolean {
		if (event.keyCode === KeyCodes.Enter) {
			this.emit('accept', sender);
		} else if (event.keyCode === KeyCodes.Esc) {
			this.emit('cancel', sender);
		}
		this.emit('keyup', sender, event);
		return true;
	}
}
