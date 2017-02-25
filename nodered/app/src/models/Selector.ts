import * as ko from 'knockout-es5';
import EventEmitter from '../lib/EventEmitter';

export interface Range {
	x: number;
	y: number;
	w: number;
	h: number;
}

export default class Selector extends EventEmitter {
	public readonly css: any
	public readonly style: any
	public readonly start: Range
	constructor() {
		super('select');
		this.css = {
			close: ko.observable(true)
		};
		this.style = {
			left: ko.observable(0),
			top: ko.observable(0),
			width: ko.observable(0),
			height: ko.observable(0)
		};
		this.start = { x: 0, y: 0, w: 0, h: 0 };
	}
	get closed(): boolean {
		return this.css.close();
	}
	set closed(enabled: boolean) {
		this.css.close(enabled);
	}
	get range(): Range {
		return { x: this.x, y: this.y, w: this.w, h: this.h };
	}
	get x(): number {
		return this.style.left();
	}
	set x(value: number) {
		this.style.left(value);
	}
	get y(): number {
		return this.style.top();
	}
	set y(value: number) {
		this.style.top(value);
	}
	get w(): number {
		return this.style.width();
	}
	set w(value: number) {
		this.style.width(value);
	}
	get h(): number {
		return this.style.height();
	}
	set h(value: number) {
		this.style.height(value);
	}
	public onEnter(sender: any, event: MouseEvent): boolean {
		// console.log('enter');
		// this.closed = true;
		return true;
	}
	public onLeave(sender: any, event: MouseEvent): boolean {
		// console.log('leave');
		this.closed = true;
		return true;
	}
	public onUp(sender: any, event: MouseEvent): boolean {
		// console.log('up');
		this.closed = true;
		this.x = (this.start.x < event.pageX ? this.start.x : event.pageX);
		this.y = (this.start.y < event.pageY ? this.start.y : event.pageY);
		this.w = (Math.abs(event.pageX - this.start.x));
		this.h = (Math.abs(event.pageY - this.start.y));
		this.emit('select', sender, event);
		return true;
	}
	public onDown(sender: any, event: MouseEvent): boolean {
		// console.log('down');
		this.start.x = event.pageX;
		this.start.y = event.pageY;
		this.start.w = 0;
		this.start.h = 0;
		this.x = (this.start.x);
		this.y = (this.start.y);
		this.w = (this.start.w);
		this.h = (this.start.h);
		this.closed = false;
		return true;
	}
	public onMove(sender: any, event: MouseEvent): boolean {
		// console.log('move', this.range);
		if (!this.closed) {
			this.x = (this.start.x < event.pageX ? this.start.x : event.pageX);
			this.y = (this.start.y < event.pageY ? this.start.y : event.pageY);
			this.w = (Math.abs(event.pageX - this.start.x));
			this.h = (Math.abs(event.pageY - this.start.y));
		}
		return true;
	}
}
