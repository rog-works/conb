import EventEmitter from './EventEmitter';

export default class WS extends EventEmitter {
	public readonly url: string
	private _ws: WebSocket
	public constructor(url: string) {
		super('message', 'open', 'close');
		this.url = url;
		this._ws = this.connect(this.url);
	}
	public connect(url: string): WebSocket {
		try {
			const ws = new WebSocket(url);
			ws.onmessage = this._onMessage.bind(this);
			ws.onopen = this._onOpen.bind(this);
			ws.onclose = this._onClose.bind(this);
			return ws;
		} catch (err) {
			console.error(err);
			throw new Error(err);
		}
	}
	public send(data: any): void {
		this._ws.send(JSON.stringify(data));
	}
	private _retry(): void {
		try {
			this._ws = this.connect(this.url);
		} catch (err) {
			setTimeout(this._retry.bind(this), 1000);
		}
	}
	private _onMessage(message: MessageEvent): boolean {
		this.emit('message', this, message);
		return true;
	}
	private _onOpen(): boolean {
		this.emit('open', this);
		return true;
	}
	private _onClose(): boolean {
		this.emit('close', this);
		this._retry();
		return true;
	}
}
