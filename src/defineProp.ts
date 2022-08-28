export default function defineProp<T extends object, K extends keyof T>(
	target: T,
	name: K,
	fn: T[K]
) {
	Reflect.defineProperty(target, name, { value: fn, configurable: true });
}
