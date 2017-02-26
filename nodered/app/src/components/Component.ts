import * as ko from 'knockout-es5';
import StringUtil from '../utils/StringUtil';

export default class Component {
	public static regist(construct: any, template: string): void {
		ko.components.register(
			construct.name,
			{
				viewModel: {
					createViewModel: (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo) => {
						return new construct(params.entity); // XXX
					}
				},
				template: template
			}
		);
	}
}
