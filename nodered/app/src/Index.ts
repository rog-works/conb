import * as ko from 'knockout';
import DAO from './lib/DAO';
import URI from './lib/URI';
import {Events} from './events/Events';
import Scroll from './events/Scroll';
import WSObserver from './models/WSObserver';
import WebObserver from './models/WebObserver';
import Logger from './models/Logger';
import ModelFactory from './models/ModelFactory';
import {default as Entry, EntryEntity} from './models/Entry';
import Entries from './models/Entries';
import Post from './models/Post';
import Tag from './models/Tag';
import Tags from './models/Tags';
import File from './models/File';
import Files from './models/Files';
import Image from './models/Image';
import {default as Site, SiteEntity} from './models/Site';
import Searcher from './models/Searcher';
import {default as Selector, Range} from './models/Selector';

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
	public focus: KnockoutObservable<string>
	private constructor() {}
	public static get self(): Main {
		return Main._self || (Main._self = new Main());
	}
	public init(e: HTMLElement): void {
		DAO.create('ws://localhost:1880/ws/api')
			.on('open', this._onOpen.bind(this))
			.on('close', this._onClose.bind(this));
		ModelFactory.self.regist(Entry);
		ModelFactory.self.regist(Post);
		ModelFactory.self.regist(Tags);
		ModelFactory.self.regist(Tag);;
		ModelFactory.self.regist(Image);
		ModelFactory.self.regist(Files);
		ModelFactory.self.regist(File);
		ModelFactory.self.regist(Site);
		this._scroll = new Scroll(32 * 11 * 2);
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
		this.focus = ko.observable('entry'); // XXX magic string
		this._scroll.on('bottom', this._onBottom.bind(this));
		this.selector.on('select', this._onSelect.bind(this));
		this.searcher.on('accept', this.searched.bind(this));
		this.entries.on('beforeUpdate', this._onEntryBeforeUpdate.bind(this));
		this.entries.on('update', this._onEntryUpdate.bind(this));
		ko.applyBindings(this, e);
	}
	public focused(tag: string): void {
		this.focus(tag);
	}
	public searched(): void {
		this.entries.load(
			this.searcher.url.value(),
			this.searcher.path.value(),
			this.searcher.query.value(),
			this.searcher.page.curr.number
		);
	}
	public filtered(): void {
		this.entries.filtered(this.searcher.filter.value());
	}
	public searched2(query: string): void {
		this.searcher.url.value(query);
		this.entries.load(query, '', '', 1);
	}
	public addedSite(): void { // XXX NG
		const url = prompt('Input indivisual site url');
		if (!url) {
			return;
		}
		const uri = new URI(url);
		const site: SiteEntity = {
			type: 'site',
			name: uri.host,
			select: [],
			from: {
				scheme: uri.scheme,
				host: uri.host,
				path: uri.path,
				queries: []
			},
			where: ''
		};
		const entity: EntryEntity = {
			type: 'entry',
			uri: uri.full,
			attrs: { site: site }
		}
		this.entries.list.push(ModelFactory.self.create<Entry>(entity));
	}
	private _onEntryBeforeUpdate(sender: Entries, page: number): boolean {
		this.searcher.page.next.number = page;
		this.webObserver.update(`begin none`);
		return true;
	}
	private _onEntryUpdate(sender: Entries, data: any[]): boolean {
		if (data.length > 0) {
			this.searcher.page.curr.number = this.searcher.page.next.number;
		}
		this.webObserver.update(`end none`);
		return true;
	}
	private _onOpen(sender: any): boolean {
		this.wsObserver.update('open');
		return true;
	}
	private _onClose(sender: any): boolean {
		this.wsObserver.update('close');
		return true;
	}
	private _onBottom (sender: any, event: any): boolean {
		// console.log('bottom');
		if (this.entries.list().length > 0 && this.searcher.url.value().length > 0 && this.searcher.page.next.number === this.searcher.page.curr.number) {
			this.entries.load(
				this.searcher.url.value(),
				this.searcher.path.value(),
				this.searcher.query.value(),
				this.searcher.page.curr.number + 1
			);
		}
		return true;
	}
	private _onSelect (sender: any, event: MouseEvent): boolean {
		this._getEntriesByRange(this.selector.range).forEach(entry => entry.selected = !entry.selected);
		return true;
	}
	private _getEntriesByRange(selectRange: Range): Entry[] {
		const entries: Entry[] = [];
		for (const elem of document.querySelectorAll('.post')) {
			const offset = elem.getBoundingClientRect();
			const range = { x: offset.left, y: offset.top, w: elem.clientWidth, h: elem.clientHeight };
			if (this._intersectRect(selectRange, range)) {
				const entry = ko.contextFor(elem).$data;
				entries.push(entry);
			}
		}
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
