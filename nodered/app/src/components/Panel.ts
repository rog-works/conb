import * as ko from 'knockout-es5';
import Component from './Component';

export type Colors = 'primary' | 'nagative';
export namespace Colors {
	export const Primary = 'primary';
	export const Negative = 'nagative';
}

export type Anchors = 'none' | 'left' | 'right' | 'top' | 'bottom';
export namespace Anchors {
	export const None = 'none';
	export const Left = 'left';
	export const Right = 'right';
	export const Top = 'top';
	export const Bottom = 'bottom';
}

export type Aligns = 'none' | 'center' | 'around';
export namespace Aligns {
	export const None = 'none';
	export const Center = 'center';
	export const Around = 'around';
}

export type Positions = 'none' | 'absolute' | 'relative' | 'fixed';
export namespace Positions {
	export const None = 'none';
	export const Absolute = 'absolute';
	export const Relative = 'relative';
	export const Fixed = 'fixed';
}

export type Docks = 'none' | 'fill';
export namespace Docks {
	export const None = 'none';
	export const Fill = 'fill';
}

type Styles = Colors | Anchors | Aligns | Positions | Docks;

export interface PanelEntity {
	color: Colors
	anchor: Anchors
	align: Aligns
	position: Positions
	dock: Docks
	w: number
	h: number
	children?: any[]
	styles?: string
}

export default class Panel {
	private _color: Colors
	private _anchor: Anchors
	private _align: Aligns
	private _position: Positions
	private _dock: Docks
	private _w: number
	private _h: number
	public readonly children: any[]
	public readonly css: KnockoutComputed<string>
	public constructor(entity: PanelEntity) {
		this._color = entity.color || Colors.Primary;
		this._anchor = entity.anchor || Anchors.None;
		this._align = entity.align || Aligns.None;
		this._position = entity.position || Positions.None;
		this._dock = entity.dock || Docks.None;
		this._w = entity.w || 1;
		this._h = entity.h || 1;
		this._attachStyles(entity.styles || '');
		this.children = entity.children || [];
		this.css = ko.computed({ owner: this, read: this._computedCss });
		if (this.constructor.name === Panel.name) {
			ko.track(this);
		}
	}
	private _attachStyles(styles: string) {
		this._color = Panel._parseStyle(Colors, styles, this._color) as Colors;
		this._anchor = Panel._parseStyle(Anchors, styles, this._anchor) as Anchors;
		this._align = Panel._parseStyle(Aligns, styles, this._align) as Aligns;
		this._position = Panel._parseStyle(Positions, styles, this._position) as Positions;
		this._dock = Panel._parseStyle(Docks, styles, this._dock) as Docks;
		this._w = Panel._parseW(styles, this._w);
		this._h = Panel._parseH(styles, this._h);
	}
	private _computedCss(): string {
		const css = Panel._loadCss();
		return [
			Panel._pluckCss(css, `color_${this._color}`),
			Panel._pluckCss(css, `anchor_${this._anchor}`),
			Panel._pluckCss(css, `align_${this._align}`),
			Panel._pluckCss(css, `position_${this._position}`),
			Panel._pluckCss(css, `dock_${this._dock}`),
			Panel._pluckCss(css, `w_${this._w}`),
			Panel._pluckCss(css, `h_${this._h}`)
		].join(' ');
	}
	private static _parseStyle(e: Object, styles: string, _default: Styles): Styles {
		const reg = new RegExp(`${Object.keys(e).join('|').toLowerCase()}`);
		const matches = styles.match(reg);
		return matches && matches.length > 0 ? matches[0] as Styles : _default;
	}
	private static _parseW(styles: string, _default: number): number {
		const matches = styles.match(/([\d]+)\s+([\d]+)$/);
		return matches && matches.length > 2 ? parseInt(matches[1]) : _default;
	}
	private static _parseH(styles: string, _default: number): number {
		const matches = styles.match(/([\d]+)\s+([\d]+)$/);
		return matches && matches.length > 2 ? parseInt(matches[2]) : _default;
	}
	private static _pluckCss(css: any, key: string): any {
		if (key in css) {
			return css[key];
		}
		throw new Error(`Not supported css. ${key}`);
	}
	private static _loadCss(): any {
		return require('./assets/Panel.css');
	}
	public static regist(): void {
		Component.regist(Panel, require('./assets/Panel.html'));
	}
}
