import EventEmitter from '../lib/EventEmitter';

export default class Mouse extends EventEmitter {
	public constructor() {
		super('enter', 'leave', 'up', 'down', 'move');
	}
	public onEnter(sender: any, event: MouseEvent): boolean {
		this.emit('enter', sender, event);
		return true;
	}
	public onLeave(sender: any, event: MouseEvent): boolean {
		this.emit('leave', sender, event);
		return true;
	}
	public onUp(sender: any, event: MouseEvent): boolean {
		this.emit('up', sender, event);
		return true;
	}
	public onDown(sender: any, event: MouseEvent): boolean {
		this.emit('down', sender, event);
		return true;
	}
	public onMove(sender: any, event: MouseEvent): boolean {
		this.emit('move', sender, event);
		return true;
	}
}
