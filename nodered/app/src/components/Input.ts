import * as ko from 'knockout';
import EventEmitter from '../lib/EventEmitter';

export enum KeyCodes {
	Enter = 13,
	Esc = 27,
	Left = 37,
	Up = 38,
	Right = 39,
	Down = 40
}

export default class Input extends EventEmitter {
	public value: KnockoutObservable<string>
	public constructor (value: string) {
		super('accept', 'cancel', 'keyup');
		this.value = ko.observable(value);
	}
	public get number(): number {
		return parseInt(this.value());
	}
	public set number(number: number) {
		this.value(`${number}`);
	}
	public onKeyup(self: any, event: KeyboardEvent): boolean {
		if (event.keyCode === KeyCodes.Enter) {
			this.emit('accept', self);
		} else if (event.keyCode === KeyCodes.Esc) {
			this.emit('cancel', self);
		}
		this.emit('keyup', self, event);
		return true;
	}
}
