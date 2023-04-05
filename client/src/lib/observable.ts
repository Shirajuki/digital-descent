export default class Observable {
	public observers: any = [];
	constructor() {}

	subscribe(func: any) {
		this.observers.push(func);
	}
	unsubscribe(func: any) {
		this.observers = this.observers.filter(
			(subscribe: any) => subscribe !== func
		);
	}
	notify() {
		this.observers.forEach((func: () => any) => func());
	}
}
