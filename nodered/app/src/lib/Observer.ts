import EventEmitter from '../lib/EventEmitter';

export default class Observer extends EventEmitter {
	public constructor() {
		super('update');
	}
	public update(message: string): void {
		this.emit('update', this, message);
	}
}
