import * as ko from 'knockout-es5';
import Component from './Component';

type Anchors = 'none' | 'left' | 'right' | 'top' | 'bottom';
namespace Anchors {
	export const None = 'none'
	export const Left = 'left'
	export const Right = 'right'
	export const Top = 'top'
	export const Bottom = 'bottom'
}

type Aligns = 'none' | 'center';
namespace Aligns {
	export const None = 'none'
	export const Center = 'center'
}

type Positions = 'none' | 'absolute' | 'relative' | 'fixed';
namespace Positions {
	export const None = 'none'
	export const Absolute = 'absolute'
	export const Relative = 'relative'
	export const Fixed = 'fixed'
}

type Docks = 'none' | 'fill';
namespace Docks {
	export const None = 'none'
	export const Fill = 'fill'
}

export interface PanelEntity {
	anchor?: Anchors
	align?: Aligns
	position?: Positions
	dock?: Docks
	w?: number
	h?: number
	children?: any[]
}

export default class Panel {
	private _anchor: Anchors
	private _align: Aligns
	private _position: Positions
	private _dock: Docks
	private _w: number
	private _h: number
	public children: any[]
	public css: KnockoutComputed<string>
	public constructor(entity: PanelEntity) {
		this._anchor = entity.anchor || Anchors.None;
		this._align = entity.align || Aligns.None;
		this._position = entity.position || Positions.None;
		this._dock = entity.dock || Docks.None;
		this._w = entity.w || 1;
		this._h = entity.h || 1;
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
	private _computedCss(): string {
		return [
			Panel._anchorToCss(this.anchor),
			Panel._alignToCss(this.align),
			Panel._positionToCss(this.position),
			Panel._dockToCss(this.dock),
			Panel._wToCss(this.w),
			Panel._hToCss(this.h)
		].join(' ');
	}
	private static _anchorToCss(anchor: Anchors): string {
		switch(anchor) {
		case Anchors.Left: return require('./assets/Panel.css').anchorLeft;
		case Anchors.Bottom: return require('./assets/Panel.css').anchorBotton;
		default: return require('./assets/Panel.css').alignNone;
		}
	}
	private static _alignToCss(align: Aligns): string {
		switch(align) {
		case Aligns.Center: return require('./assets/Panel.css').alignCenter;
		default: return require('./assets/Panel.css').alignNone;
		}
	}
	private static _positionToCss(position: Positions): string {
		switch(position) {
		case Positions.Absolute: return require('./assets/Panel.css').positionAbsolute;
		default: return require('./assets/Panel.css').positionNone;
		}
	}
	private static _dockToCss(dock: Docks): string {
		switch(dock) {
		case Docks.Fill: return require('./assets/Panel.css').dockFill;
		default: return require('./assets/Panel.css').dockNone;
		}
	}
	private static _wToCss(w: number): string {
		switch(w) {
		case 8: return require('./assets/Panel.css').w8;
		}
		throw new Error(`Not supported width. ${w}`);
	}
	private static _hToCss(h: number): string {
		switch(h) {
		case 10: return require('./assets/Panel.css').h10;
		}
		throw new Error(`Not supported height. ${h}`);
	}
	public static regist(): void {
		Component.regist(Panel, require('./assets/Panel.html'));
	}
}
