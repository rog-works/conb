import * as ko from 'knockout-es5';
import Component from './Component';

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
	private readonly _anchor: Anchors
	private readonly _align: Aligns
	private readonly _position: Positions
	private readonly _dock: Docks
	private readonly _w: number
	private readonly _h: number
	public readonly children: any[]
	public readonly css: KnockoutComputed<string>
	public constructor(entity: PanelEntity) {
		this._anchor = entity.anchor || Anchors.None;
		this._align = entity.align || Aligns.None;
		this._position = entity.position || Positions.None;
		this._dock = entity.dock || Docks.None;
		this._w = entity.w || 1;
		this._h = entity.h || 1;
		this.children = entity.children || [];
		this.css = ko.computed({ owner: this, read: this._computedCss });
		if (this.constructor.name === Panel.name) {
			ko.track(this);
		}
	}
	private _computedCss(): string {
		const styles = Panel._loadStyles();
		return [
			Panel._pluckStyle(styles, `anchor_${this._anchor}`),
			Panel._pluckStyle(styles, `align_${this._align}`),
			Panel._pluckStyle(styles, `position_${this._position}`),
			Panel._pluckStyle(styles, `dock_${this._dock}`),
			Panel._pluckStyle(styles, `w_${this._w}`),
			Panel._pluckStyle(styles, `h_${this._h}`)
		].join(' ');
	}
	private static _pluckStyle(styles: any, key: string): any {
		if (key in styles) {
			return styles[key];
		}
		throw new Error(`Not supported style. ${key}`);
	}
	private static _loadStyles(): any {
		return require('./assets/Panel.css');
	}
	public static regist(): void {
		Component.regist(Panel, require('./assets/Panel.html'));
	}
}
