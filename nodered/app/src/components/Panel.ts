import * as ko from 'knockout-es5';
import Component from './Component';

export enum Aligns {
	Left,
	Right,
	Top,
	Bottom,
	Center
}

export enum Docks {
	None,
	Fill
}

export enum Positions {
	None,
	Absolute,
	Relative,
	Fixed
}

export default class Panel {
	public constructor(
		private _dock: number = Docks.None,
		private _align: number = Aligns.Left,
		private _position: number = Positions.None,
		private _w: number = 1,
		private _h: number = 1,
		public childs: any[], // FIXME
		public css: any = {}
	) {
		ko.track(this);
	}
	public add(child: any): void {
		this.childs.push(child);
	}
	public remove(child: any): void {
		this.childs.remove(child);
	}
	public get dock(): Docks {
		return this._dock;
	}
	public set dock(dock: Docks) {
		this._dock = dock;
		this.css = Panel._toCss(this.dock, this.align, this.position, this.w, this.h);
	}
	public get align(): Aligns {
		return this._align;
	}
	public set align(align: Aligns) {
		this._align = align;
		this.css = Panel._toCss(this.dock, this.align, this.position, this.w, this.h);
	}
	public get position(): Positions {
		return this._position;
	}
	public set position(position: Positions) {
		this._position = position;
		this.css = Panel._toCss(this.dock, this.align, this.position, this.w, this.h);
	}
	public get w(): number {
		return this._w;
	}
	public set w(w: number) {
		this._w = w;
		this.css = Panel._toCss(this.dock, this.align, this.position, this.w, this.h);
	}
	public get h(): number {
		return this._h;
	}
	public set h(h: number) {
		this._h = h;
		this.css = Panel._toCss(this.dock, this.align, this.position, this.w, this.h);
	}
	private static _dockToCss(dock: Docks): any {
		switch(dock) {
		case Docks.Fill: return require('./assets/Panel.css').dockFill;
		default: return require('./assets/Panel.css').dockNone;
		}
	}
	private static _alignToCss(align: Aligns): any {
		switch(align) {
		case Aligns.Left: return require('./assets/Panel.css').alignLeft;
		case Aligns.Bottom: return require('./assets/Panel.css').alignBottom;
		default: return require('./assets/Panel.css').alignNone;
		}
	}
	private static _positionToCss(position: Positions): any {
		switch(position) {
		case Positions.Absolute: return require('./assets/Panel.css').positionAbsolute;
		default: return require('./assets/Panel.css').positionNone;
		}
	}
	private static _wToCss(w: number): any {
		switch(w) {
		case 8: return require('./assets/Panel.css').positionAbsolute;
		default: return require('./assets/Panel.css').positionNone;
		}
	}
}

Component.regist(Panel, require('./assets/Panel.html'));
