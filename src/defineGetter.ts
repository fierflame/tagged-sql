import defineProp from './defineProp';

export default function defineGetter<T extends object, K extends keyof T>(
	target: T,
	name: K,
	get: (sql: T) => T[K]
) {
	Reflect.defineProperty(target, name, {
		get(this: T) {
			const value = get(this);
			defineProp(this, name, value);
			return value;
		},
		configurable: true,
	});
}
