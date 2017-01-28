import EventEmitter from '../lib/EventEmitter';

export default class Mouse extends EventEmitter {
	public constructor() {
		super('enter', 'leave', 'up', 'down', 'move');
	}
	public onEnter(self: Mouse, event: MouseEvent): boolean {
		this.emit('enter', this, event);
		return true;
	}
	public onLeave(self: Mouse, event: MouseEvent): boolean {
		this.emit('leave', this, event);
		return true;
	}
	public onUp(self: Mouse, event: MouseEvent): boolean {
		this.emit('up', this, event);
		return true;
	}
	public onDown(self: Mouse, event: MouseEvent): boolean {
		this.emit('down', this, event);
		return true;
	}
	public onMove(self: Mouse, event: MouseEvent): boolean {
		this.emit('move', this, event);
		return true;
	}
}
