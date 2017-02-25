import * as ko from 'knockout-es5';

export default class Select {
	public constructor(
		public readonly options: Option[],
		public value: string = ''
	) {
		ko.track(this);
	}
}

export class Option {
	public constructor(
		public readonly value: string,
		public readonly text: string
	) {}
}
