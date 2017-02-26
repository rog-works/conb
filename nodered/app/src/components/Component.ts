import * as ko from 'knockout-es5';

export default class Component {
	public static regist(construct: any, template: string): void {
		ko.components.register(
			construct.name,
			{
				viewModel: {
					createViewModel: (params: any, componentInfo: KnockoutComponentTypes.ComponentInfo): any => {
						return new construct(params);
					}
				},
				template: template
			}
		);
	}
}
