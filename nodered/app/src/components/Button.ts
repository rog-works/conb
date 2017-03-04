import * as ko from 'knockout-es5';
import Component from './Component';

type States = 'standby' | 'progress' | 'success' | 'error';
namespace States {
	export const Standby = 'standby';
	export const Progress = 'progress';
	export const Success = 'success';
	export const Error = 'error';
}

export interface ButtonEntity {
	icon: string
	click: Function
	transit: Function
}

export default class Button {
	public type: string
	private _state: States
	private _icon: string
	private _click: Function
	public css: KnockoutComputed<string>
	public constructor(entity: ButtonEntity) {
		this._state = States.Standby;
		this._icon = entity.icon;
		this._click = entity.click;
		this.css = ko.computed({ owner: this, read: this._computedCss });
		ko.track(this);
	}
	// @override
	protected _computedCss(): string {
		const css = require('./assets/Button.css');
		return [
			css.css,
			css[this._state],
			this._state !== States.Progress ? this._icon : 'fa-refresh fa-spin' // XXX
		].join(' ');
	}
	public click(): boolean {
		this._transit('progress');
		this._click();
		return true;
	}
	private _transit(state: States): void {
		this._state = state;
	}
	public static regist(): void {
		Component.regist(Button, require('./assets/Button.html'));
	}
}
