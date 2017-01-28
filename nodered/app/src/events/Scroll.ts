import EventEmitter from '../lib/EventEmitter';

export default class Scroll extends EventEmitter {
	public readonly threshold: number // XXX bad inject timing
	public constructor(threshold: number) {
		super('bottom');
		this.threshold = threshold;
	}
	public onScroll(sender: any, event: any): void {
		const e: HTMLElement = event.target;
		const y: number = e.clientHeight + e.scrollTop;
		if (e.scrollHeight - y < this.threshold) {
			this.emit('bottom', sender, event);
		}
	}
}
