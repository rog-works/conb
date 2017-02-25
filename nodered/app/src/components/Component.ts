import * as ko from 'knockout-es5';
import StringUtil from '../utils/StringUtil';

export default class Component {
	public static regist(vmClass: any, template: string): void {
		ko.components.register(
			StringUtil.snakelize(<any>vmClass.constructor.name),
			{
				viewModel: vmClass,
				template: template
			}
		);
	}
}
