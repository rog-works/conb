import * as ko from 'knockout';
import Observer from '../lib/Observer';

export default class WSObserver extends Observer {
	public style: any
	constructor() {
		super();
		this.style = {
			color: ko.observable('#aaa')
		};
		this.on('update', this._onUpdate.bind(this));
	}
	_onUpdate(self: WSObserver, message: string) {
		this.style.color(message === 'open' ? '#4c4' : '#aaa');
	}
}
