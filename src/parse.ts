import Sql from '.';
import rmSpaces from './rmSpaces';
import toSql from './toSql';

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
		if (item instanceof Sql.Field || item instanceof Sql.Table) {
			template.push(end.join(' '));
			values.push(item);
			end = it ? [it] : [];
			continue;
		}
		const v = toSql(item);
		if (!(v instanceof Sql)) {
			template.push(end.join(' '));
			values.push(v);
			end = it ? [it] : [];
			continue;
		}
		const [first, ...s] = v._template;
		if (first) { end.push(first); }
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
