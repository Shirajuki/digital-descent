export default class Observable {
	public observers: any = [];
	constructor() {}

	subscribe(func: any, type: string = "battle") {
		this.observers.push([func, type]);
	}
	unsubscribe(func: any) {
		this.observers = this.observers.filter(
			(subscribe: any) => subscribe !== func
		);
	}
	notify(type: string = "battle") {
		this.observers.forEach((observer: any) => {
			if (type === observer[1]) {
				observer[0]();
			}
		});
	}
}
