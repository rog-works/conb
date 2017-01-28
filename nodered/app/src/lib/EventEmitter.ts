export interface EventHandler {
	(self: any, event?: any): boolean
}

interface EventHandlers {
	[tag: string]: Array<EventHandler>
}

export default class EventEmitter {
	private _handlers: EventHandlers
	public constructor(...tags: Array<string>) {
		this._handlers = {};
		for (const tag of tags) {
			this._handlers[tag] = [];
		}
	}
	public on(tag: string, callback: EventHandler): this {
		if (this._handlers[tag].indexOf(callback) === -1) {
			this._handlers[tag].unshift(callback);
		}
		return this;
	}
	public off(tag: string, callback: EventHandler): this {
		const index = this._handlers[tag].indexOf(callback);
		if (index !== -1) {
			this._handlers[tag].splice(index, 1);
		}
		return this;
	}
	public emit(tag: string, self: any, event: any = undefined) {
		for (const handler of this._handlers[tag]) {
			if (!handler(self, event)) {
				break;
			}
		}
	}
}
