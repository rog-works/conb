import * as ko from 'knockout';

export default class Select {
	public options: KnockoutObservableArray<Option>
	public value: KnockoutObservable<string>
	public constructor (options: Array<Option>) {
		this.options = ko.observableArray(options);
		this.value = ko.observable('');
	}
}

export class Option {
	public constructor (
		public readonly value: string,
		public readonly text: string) {}
}
