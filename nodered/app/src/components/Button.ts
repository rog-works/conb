import * as ko from 'knockout-es5';
import Component from './Component';

export interface ButtonEntity {
	buttonType: string
	context: any
}

export default class Button {
	public readonly buttonType: string
	public readonly context: any
	public readonly css: string
	public constructor(entity: ButtonEntity) {
		this.buttonType = entity.buttonType;
		this.context = entity.context;
		this.css = require('./assets/Button.css');
		ko.track(this);
	}
	public static regist(): void {
		Component.regist(Button, require('./assets/Button.html'));
	}
}
