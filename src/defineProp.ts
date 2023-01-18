export default function defineProp<
	T extends object,
	K extends keyof T,
>(target: T, name: K, value: T[K]) {
	Reflect.defineProperty(target, name, { value, configurable: true });
}
