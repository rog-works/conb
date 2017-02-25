import * as ko from 'knockout-es5';
import Observer from '../lib/Observer';

export default class WSObserver extends Observer {
	public connected: KnockoutObservable<boolean>
	public constructor() {
		super();
		this.connected = ko.observable(false);
		this.on('update', this._onUpdate.bind(this));
	}
	public _onUpdate(sender: any, message: string): boolean {
		this.connected(message === 'open');
		return true;
	}
}
