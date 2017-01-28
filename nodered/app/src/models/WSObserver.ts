import * as ko from 'knockout';
import Observer from '../lib/Observer';

export default class WSObserver extends Observer {
	public style: any
	public constructor() {
		super();
		this.style = {
			color: ko.observable('#aaa')
		};
		this.on('update', this._onUpdate.bind(this));
	}
	public _onUpdate(sender: any, message: string): boolean {
		this.style.color(message === 'open' ? '#4c4' : '#aaa');
		return true;
	}
}
