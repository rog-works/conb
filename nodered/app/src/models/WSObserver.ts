import * as ko from 'knockout-es5';
import Observer from '../lib/Observer';

export default class WSObserver extends Observer {
	public constructor(
		public connected: boolean = false
	) {
		super();
		this.on('update', this._onUpdate.bind(this));
		ko.track(this);
	}
	public _onUpdate(sender: any, message: string): boolean {
		this.connected = message === 'open';
		return true;
	}
}
