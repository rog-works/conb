import * as ko from 'knockout';
import EventEmitter from '../lib/EventEmitter';
import DAO from '../lib/DAO';
import {default as Input, KeyCodes} from '../components/Input';
import {Option} from '../components/Select';

export default class Searcher extends EventEmitter {
	public readonly url: Input
	public readonly path: Input
	public readonly query: Input
	public readonly filter: Input
	public page: {curr: Input, next: Input}
	public css: any
	public urls: KnockoutObservableArray<Option>
	public events: any
	public constructor() {
		super('accept');
		this.url = new Input('');
		this.path = new Input('');
		this.query = new Input('');
		this.filter = new Input('');
		this.page = {
			curr: new Input('1'), // XXX number
			next: new Input('1')
		};
		this.urls = ko.observableArray([]);
		this.events = {
			focus: this.url.onFocus.bind(this.url),
			keyup: this.url.onKeyup.bind(this.url)
		};
		this.url.on('focus', this._onFocus.bind(this));
		this.url.on('accept', this._onAccept.bind(this));
		this.url.on('cancel', this._onCancel.bind(this));
		this.url.on('keyup', this._onKeyup.bind(this));
	}
	private _loadUrls() {
		DAO.self.once('urls', {})
			.then((entities: Array<Array<string>>) => {
				entities.forEach(([value, text]) => {
					this.urls.push(new Option(value, text));
				});
			});
	}
	private _onFocus(sender: Input): boolean {
		if (this.urls().length === 0) {
			this._loadUrls();
		}
		return true;
	}
	private _onAccept(self: Searcher): boolean {
		this.emit('accept', self);
		return true;
	}
	private _onCancel(self: Searcher): boolean {
		this.clear();
		return true;
	}
	private _onKeyup(self: Searcher, event: KeyboardEvent): boolean {
		if (event.keyCode === KeyCodes.Up) {
			this.page.curr.number = Math.max(this.page.curr.number - 1, 1);
		} else if (event.keyCode === KeyCodes.Down) {
			this.page.curr.number = this.page.curr.number + 1;
		}
		return true;
	}
	public clear() {
		this.url.value('');
		this.path.value('');
		this.query.value('');
		this.filter.value('');
		this.page.curr.number = 1;
		this.page.next.number = 1;
	}
}
