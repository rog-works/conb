import * as ko from 'knockout';
import * as $ from 'jquery';
import * as Promise from 'promise';
import WS from './lib/WS';
import DAO from './lib/DAO';
import Sign from './lib/Sign';
import Input from './components/Input';
import {Option} from './components/Select';
import {Events} from './events/Events';
import Scroll from './events/Scroll';
import WSObserver from './models/WSObserver';
import WebObserver from './models/WebObserver';
import Logger from './models/Logger';
import {default as Entries, Entry, Post, EntryFactory} from './models/Entry';
import Retention from './models/Retention';
import Searcher from './models/Searcher';
import {default as Selector, Range} from './models/Selector';
import File from './models/File';

export default class Main {
	private static _self: Main
	private _scroll: Scroll
	public wsObserver: WSObserver
	public webObserver: WebObserver
	public logger: Logger
	public searcher: Searcher
	public selector: Selector
	public entries: Entries
	public events: Events
	public urls: KnockoutObservableArray<Option>
	public focus: KnockoutObservable<string>
	private _ws: WS
	private constructor() {}
	public static get self(): Main {
		if (Main._self === undefined) { // XXX null safe???
			Main._self = new Main();
		}
		return Main._self;
	}
	public init(e: HTMLElement) {
		this._scroll = new Scroll(256);
		this.wsObserver = new WSObserver();
		this.webObserver = new WebObserver();
		this.logger = new Logger();
		this.searcher = new Searcher();
		this.selector = new Selector();
		this.entries = new Entries();
		this.events = {
			scroll: this._scroll.onScroll.bind(this._scroll),
			mouseover: this.selector.onEnter.bind(this.selector),
			mouseleave: this.selector.onLeave.bind(this.selector),
			mouseup: this.selector.onUp.bind(this.selector),
			mousedown: this.selector.onDown.bind(this.selector),
			mousemove: this.selector.onMove.bind(this.selector)
		};
		this.urls = ko.observableArray([]);
		this.focus = ko.observable('entry'); // XXX magic string
		this.entries.on('update', this._onEntryUpdate.bind(this));
		DAO.create('ws://localhost:1880/ws/api')
			.on('open', this._onOpen.bind(this))
			.on('close', this._onClose.bind(this));
		this._scroll.on('bottom', this._onBottom.bind(this));
		this.selector.on('select', this._onSelect.bind(this));
		this.searcher.on('accept', this.searched.bind(this));
		ko.applyBindings(this, e);
		this._loadUrls();
	}
	private _request(url: string, data: any = {}) {
		return new Promise((resolve: Function, reject: Function) => {
			console.log('request', url, data);
			$.ajax({
				url: url,
				// type: 'text', XXX unknown content type...
				success: resolve.bind(this),
				error: reject.bind(this)
			});
		});
	}
	private _loadUrls() {
		this._request('http://localhost:1880/urls')
			.then((data: string) => {
				console.log('respond', data);
				JSON.parse(data).forEach(([value, text]: any) => {
					this.searcher.urls.push(new Option(value, text));
				});
			})
			.catch((err) => {
				console.error('error', err);
			});
	}
	private _loadPosts(url: string, path: string, query: string, page: number) {
		if (!url) {
			console.log('url empty');
			return;
		}
		this.entries.load(url, path, query, page);
		this.searcher.page.next.number = page;
		// this.webObserver.update(`begin ${data.digest}`);
		this.webObserver.update(`begin none`);
	}
	public test() {
		for (let i = 0; i < 5; i += 1) {
			const entity = {
				signature: Sign.digest('https://google.co.jp/' + i),
				_id: '',
				uri: 'https://google.co.jp/' + i,
				type: 'post',
				retention: {
					visit: false,
					store: false,
					bookmark: false
				},
				href: 'https://google.co.jp/' + i,
				src: '',
				text: 'hogehoge, ' + i,
				date: 'none'
			};
			this.entries.list.push(new Post(entity));
		}
	}
	public focused(tag: string) {
		this.focus(tag);
	}
	public cleared() {
		this.searcher.clear();
		this.entries.clear();
	}
	public searched(self: Main) {
		this._loadPosts(
			this.searcher.url.value(),
			this.searcher.path.value(),
			this.searcher.query.value(),
			this.searcher.page.curr.number
		);
	}
	public filtered() {
		this.entries.filtered(this.searcher.filter.value());
	}
	public downloadedAll(self: Main) {
		const entries = this.entries.selectedEntries();
		if (entries.length === 0) {
			console.log('selected empty');
			return;
		}
		const baseDir = File.confirm(File.real(''));
		if (!baseDir) {
			console.log('download cancel');
			return;
		}
		for(const entry of entries) {
			if (entry instanceof Post) {
				const post = <Post>entry;
				const matches = post.href.match(/^[^:]+:\/\/([^\/]+)/) || [];
				if (matches.length > 0) {
					const host = matches[1];
					const dir = `${baseDir}${host}/`;
					File.save(post.href, dir); // XXX save to host dir
				}
			}
		}
	}
	private _onEntryUpdate(self: Main, message: MessageEvent): boolean { // FIXME has many called
		console.log('message', message);
		this.searcher.page.curr.number = this.searcher.page.next.number;
		// this.webObserver.update(`end ${data.digest}`); // XXX
		this.webObserver.update(`end none`);
		return true;
	}
	private _onOpen(self: Main): boolean {
		console.log('open');
		this.wsObserver.update('open');
		return true;
	}
	private _onClose(self: Main): boolean {
		console.log('close');
		this.wsObserver.update('close');
		return true;
	}
	private _onBottom (self: Main, event: any): boolean {
		// console.log('bottom');
		if (this.searcher.page.next.number === this.searcher.page.curr.number) {
			this._loadPosts(
				this.searcher.url.value(),
				this.searcher.path.value(),
				this.searcher.query.value(),
				this.searcher.page.curr.number + 1);
		}
		return true;
	}
	private _onSelect (self: Main, event: MouseEvent): boolean {
		this._getEntriesByRange(this.selector.range).forEach(entry => entry.selected = !entry.selected);
		return true;
	}
	private _getEntriesByRange(selectRange: Range): Array<Entry> {
		const entries: Array<Entry> = [];
		// XXX jQuery
		$('.post').each((index, elem) => {
			const e = $(elem);
			const offset = e.offset();
			const range = { x: offset.left, y: offset.top, w: e.width(), h: e.height() };
			if (this._intersectRect(selectRange, range)) {
				const entry = ko.contextFor(elem).$data;
				entries.push(entry);
			}
		});
		return entries;
	}
	private _intersectRect(a: Range, b: Range): boolean {
		return (a.x <= b.x + b.w && a.x + a.w >= b.x)
			&& (a.y <= b.y + b.h && a.y + a.h >= b.y);
	}
}
const e = document.getElementById('main');
if (e !== null) { // XXX null safe???
	Main.self.init(e);
} else {
	console.error('#main element not found');
}
