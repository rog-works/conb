import * as ko from 'knockout-es5';
import Util from '../utils/Util';
import Component from './Component';
import {default as Panel, PanelEntity, Aligns} from './Panel';

export interface ToolbarEntity extends PanelEntity {
	context: any
	types: string[]
}

export default class Toolbar extends Panel {
	public readonly buttons: any[]
	public constructor(entity: ToolbarEntity) {
		super(Util.extend(
			entity,
			{
				align: Aligns.Around,
				w: entity.types.length,
				h: 1,
				children: entity.types.map(type => {
					return { type: 'button', buttonType: type, context: entity.context };
				})
			}
		));
		ko.track(this);
	}
	public static regist(): void {
		Component.regist(Toolbar, require('./assets/Panel.html'));
	}
}
