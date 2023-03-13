import Sql from '.';
import isIdLike from './isIdLike';
import isLike from './isLike';
import rmSpaces from './rmSpaces';

export default function parse(
	t: readonly string[],
	value: any[],
): [string[], any[]] {
	const texts = t.slice(1);
	const first = rmSpaces(t[0]);
	const template: string[] = [];
	let end = first ? [first] : [];
	const values: any[] = [];
	for (let i = 0; i < texts.length; i++) {
		const item = value[i];
		const it = rmSpaces(texts[i]);
		if (item === undefined) {
			if (it) { end.push(it); }
			continue;
		}
		if (isIdLike(item) || !isLike(item)) {
			template.push(end.join(' '));
			values.push(item);
			end = it ? [it] : [];
			continue;
		}
		const v = item.toTaggedSql();
		if (typeof v === 'string') {
			if (v) { end.push(v); }
			if (it) { end.push(it); }
		}
		if (isIdLike(v) || !(v instanceof Sql)) {
			template.push(end.join(' '));
			values.push(v);
			end = it ? [it] : [];
			continue;
		}
		// eslint-disable-next-line prefer-destructuring
		const first = v._template[0];
		if (first) { end.push(first); }
		const s = v._template.slice(1);
		if (s.length) {
			template.push(end.join(' '));
			const last = s.pop();
			end = last ? [last] : [];
			values.push(...v._values);
			template.push(...s);
		}
		if (it) { end.push(it); }
	}
	template.push(end.join(' '));
	return [template, values];
}
