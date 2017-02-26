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
	Inherit,
	Absolute,
	Relative,
	Fixed
}

export default class Panel {
	public constructor(
		private _dock: number = Docks.None,
		private _align: number = Aligns.Left,
		private _position: number = Positions.Inherit,
		private _range: any = {},
		private _css: any = {}
	) {
		ko.track(this);
	}
	public set dock(dock: Docks) {
		this._dock = dock;
	}
	private static _dockToCss(dock: Docks): any {
		switch(dock) {
		case Docks.Fill: return require('./assets/Panel.css').fill;
		default: return require('./assets/Panel.css').none;
		}
	}
}

Component.regist(Panel, require('./assets/Panel.html'));
