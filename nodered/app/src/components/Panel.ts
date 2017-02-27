import * as ko from 'knockout-es5';
import Util from '../utils/Util';
import Component from './Component';

export enum Anchors {
	None,
	Left,
	Right,
	Top,
	Bottom
}

export enum Aligns {
	None,
	Center
}

export enum Positions {
	None,
	Absolute,
	Relative,
	Fixed
}

export enum Docks {
	None,
	Fill
}

export interface PanelEntity {
	anchor?: string
	align?: string
	position?: string
	dock?: string
	w?: number
	h?: number
	children?: any[]
}

const toAnchor = (str: string): Anchors => {
	switch(str) {
	case Anchors[Anchors.Left]: return Anchors.Left;
	case Anchors[Anchors.Right]: return Anchors.Right;
	case Anchors[Anchors.Top]: return Anchors.Top;
	case Anchors[Anchors.Bottom]: return Anchors.Bottom;
	default: return Anchors.None;
	}
}

const toAlign = (str: string): Aligns => {
	switch(str) {
	case Aligns[Aligns.Center]: return Aligns.Center;
	default: return Aligns.None;
	}
}

const toPosition = (str: string): Positions => {
	switch(str) {
	case Positions[Positions.Absolute]: return Positions.Absolute;
	case Positions[Positions.Relative]: return Positions.Relative;
	case Positions[Positions.Fixed]: return Positions.Fixed;
	default: return Positions.None;
	}
}

const toDock = (str: string): Docks => {
	switch(str) {
	case Docks[Docks.Fill]: return Docks.Fill;
	default: return Docks.None;
	}
}

export default class Panel {
	private _anchor: Anchors
	private _align: Aligns
	private _position: Positions
	private _dock: Docks
	private _w: number
	private _h: number
	public children: any[]
	public css: KnockoutComputed<any>
	public constructor(entity: PanelEntity) {
		this._anchor = toAnchor(entity.anchor || Anchors[Anchors.None]),
		this._align = toAlign(entity.align || Aligns[Aligns.None]),
		this._position = toPosition(entity.position || Positions[Positions.None]),
		this._dock = toDock(entity.dock || Docks[Docks.None]),
		this._w = entity.w || 1,
		this._h = entity.h || 1,
		this.children = entity.children || [];
		this.css = ko.computed({ owner: this, read: this._computedCss });
		ko.track(this);
	}
	public add(child: any): void {
		this.children.push(child);
	}
	public remove(child: any): void {
		this.children.remove(child);
	}
	public get anchor(): Anchors {
		return this._anchor;
	}
	public set anchor(anchor: Anchors) {
		this._anchor = anchor;
	}
	public get align(): Aligns {
		return this._align;
	}
	public set align(align: Aligns) {
		this._align = align;
	}
	public get position(): Positions {
		return this._position;
	}
	public set position(position: Positions) {
		this._position = position;
	}
	public get dock(): Docks {
		return this._dock;
	}
	public set dock(dock: Docks) {
		this._dock = dock;
	}
	public get w(): number {
		return this._w;
	}
	public set w(w: number) {
		this._w = w;
	}
	public get h(): number {
		return this._h;
	}
	public set h(h: number) {
		this._h = h;
	}
	private _computedCss(): any {
		return Util.extend(
			{ [Panel._anchorToCss(this.anchor)]: true },
			{ [Panel._alignToCss(this.align)]: true },
			{ [Panel._positionToCss(this.position)]: true },
			{ [Panel._dockToCss(this.dock)]: true },
			{ [Panel._wToCss(this.w)]: true },
			{ [Panel._hToCss(this.h)]: true }
		);
	}
	private static _anchorToCss(anchor: Anchors): any {
		switch(anchor) {
		case Anchors.Left: return require('./assets/Panel.css').anchorLeft;
		case Anchors.Bottom: return require('./assets/Panel.css').anchorBotton;
		default: return require('./assets/Panel.css').alignNone;
		}
	}
	private static _alignToCss(align: Aligns): any {
		switch(align) {
		case Aligns.Center: return require('./assets/Panel.css').alignCenter;
		default: return require('./assets/Panel.css').alignNone;
		}
	}
	private static _positionToCss(position: Positions): any {
		switch(position) {
		case Positions.Absolute: return require('./assets/Panel.css').positionAbsolute;
		default: return require('./assets/Panel.css').positionNone;
		}
	}
	private static _dockToCss(dock: Docks): any {
		switch(dock) {
		case Docks.Fill: return require('./assets/Panel.css').dockFill;
		default: return require('./assets/Panel.css').dockNone;
		}
	}
	private static _wToCss(w: number): any {
		switch(w) {
		case 8: return require('./assets/Panel.css').w8;
		}
		throw new Error(`Not supported width. ${w}`);
	}
	private static _hToCss(h: number): any {
		switch(h) {
		case 10: return require('./assets/Panel.css').h10;
		}
		throw new Error(`Not supported height. ${h}`);
	}
	public static regist(): void {
		Component.regist(Panel, require('./assets/Panel.html'));
	}
}
