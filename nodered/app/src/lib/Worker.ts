import * as Promise from 'promise';
import Sign from './Sign';
import EventEmitter from './EventEmitter';

interface Tasks {
	[future: string]: Task
}

interface Results {
	[future: string]: any
}

enum States {
	STANBY,
	RUN
}

export default class Mediator {
	public static STARTED_INTERVAL_MSEC = 10
	public static WAIT_INTERVAL_MSEC = 500
	public static MAX_WORKERS = 100
	private static _self: Mediator
	private constructor(
		private _tasks: Tasks = {},
		private _results: Results = {},
		private _workers: Worker[] = [],
		private _id: number = 0,
		private _state: States = States.STANBY,
		private _seq: number = 0
	) {}
	public static get self(): Mediator {
		return Mediator._self || (Mediator._self = new Mediator());
	}
	public request(task: Task): string {
		const future = Sign.digest(this._seq++);
		this._tasks[future] = task;
		this.start();
		console.log('request task', future, task);
		return future;
	}
	public completed(future: string): boolean {
		return future in this._results;
	}
	public response(future: string): any {
		const result = this._results[future];
		delete this._results[future];
		return result;
	}
	public complete(future: string, result: any): void {
		this._results[future] = result;
		console.log('complete task', future, result);
	}
	public start(): void {
		if (this._state === States.STANBY) {
			this._state = States.RUN;
			this._id = setTimeout(this.run.bind(this), Mediator.STARTED_INTERVAL_MSEC);
		}
	}
	public run(): void {
		clearTimeout(this._id);
		for (const future in this._tasks) {
			if (this._workers.length < Mediator.MAX_WORKERS) {
				const task = this._tasks[future];
				delete this._tasks[future];
				const worker = new Worker(this, future, task);
				this._workers.push(worker);
				worker.run();
				console.log('start task', future, task);
			}
		}
		if (Object.keys(this._tasks).length > 0) {
			this._id = setTimeout(this.run.bind(this), Mediator.WAIT_INTERVAL_MSEC);
		} else {
			this._state = States.STANBY;
		}
	}
}

class Worker {
	public constructor(
		private _mediator: Mediator,
		private _future: string,
		private _task: Task
	) {}
	public run(): void {
		const result = this._task.run();
		if (result instanceof Promise) {
			result.then((response) => {
				this._mediator.complete(this._future, response);
			});
		} else {
			this._mediator.complete(this._future, result);
		}
	}
}

class Task {
	public constructor(
		public run: Function
	) {}
}

export class Future<T> extends EventEmitter {
	private _value: T
	private _id: number
	private _future: string
	public constructor(value: T, callback: Function) {
		super('update');
		this._value = value;
		this._future = Mediator.self.request(new Task(callback));
		this._id = setTimeout(this.inquiry.bind(this), 50);
	}
	public inquiry(): void {
		clearTimeout(this._id);
		if (Mediator.self.completed(this._future)) {
			this.emit('update', this, Mediator.self.response(this._future));
		} else {
			setTimeout(this.inquiry.bind(this), 1000);
		}
	}
	public get value(): T {
		return this._value;
	}
}
