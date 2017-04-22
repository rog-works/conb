import * as ko from 'knockout-es5';
import EventEmitter from '../lib/EventEmitter';
import DAO from '../lib/DAO';
import {default as Input, KeyCodes} from '../components/Input';
import {Option} from '../components/Select';

export default class Searcher extends EventEmitter {
	public readonly url: Input
	public readonly path: Input
	public readonly query: Input
	public readonly filter: Input
	public readonly page: { curr: Input, next: Input, auto: boolean }
	public readonly css: any
	public readonly urls: Option[]
	public readonly events: any
	public constructor() {
		super('accept');
		this.url = new Input();
		this.path = new Input();
		this.query = new Input();
		this.filter = new Input();
		this.page = {
			curr: new Input(1),
			next: new Input(1),
			auto: true
		};
		this.urls = [];
		this.events = {
			keyup: this.url.onKeyup.bind(this.url)
		};
		this.url.on('accept', this._onAccept.bind(this));
		this.url.on('cancel', this._onCancel.bind(this));
		this.url.on('keyup', this._onKeyup.bind(this));
		ko.track(this, ['urls']);
		ko.track(this.page, ['auto']); // XXX
	}
	private _onAccept(sender: any): boolean {
		this.emit('accept', sender);
		return true;
	}
	private _onCancel(sender: any): boolean {
		this.clear();
		return true;
	}
	private _onKeyup(sender: any, event: KeyboardEvent): boolean {
		if (event.shiftKey && event.ctrlKey) {
			return this._shiftCtrlKeyup(event); // FIXME
		} else {
			return this._keyup(event);
		}
	}
	private _keyup(event: KeyboardEvent): boolean {
		if (event.keyCode === KeyCodes.Up) {
			this.page.curr.number = Math.max(this.page.curr.number - 1, 1);
		} else if (event.keyCode === KeyCodes.Down) {
			this.page.curr.number = this.page.curr.number + 1;
		}
		return true;
	}
	private _shiftCtrlKeyup(event: KeyboardEvent): boolean {
		if (event.keyCode === KeyCodes.F) {
			this.url.focus = true;
		}
		return true;
	}
	public clear(): void {
		this.url.value = '';
		this.path.value = '';
		this.query.value = '';
		this.filter.value = '';
		this.page.curr.number = 1;
		this.page.next.number = 1;
	}
	public get canAutoPager(): boolean {
		return this.url.value.length > 0 && this.page.auto && this.page.next.number === this.page.curr.number;
	}
	public toggleAutoPager() {
		this.page.auto = !this.page.auto;
	}
}
