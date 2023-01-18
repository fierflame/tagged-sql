import Sql from '.';
import isIdLike from './isIdLike';
import rmSpaces from './rmSpaces';
import toSql from './toSql';

export default function link(args: any[]): [string[], any[]] {
	const values: any[] = [];
	const template: string[] = [];
	let end: string[] = [];
	for (const item of args) {
		if (item === undefined) { continue; }
		if (typeof item === 'string') {
			const v = rmSpaces(item);
			if (v) { end.push(v); }
			continue;
		}
		if (typeof item === 'number') {
			end.push(String(item));
			continue;
		}
		if (isIdLike(item)) {
			template.push(end.join(' '));
			values.push(item);
			end = [];
			continue;
		}
		const sql = toSql(item);
		if (!(sql instanceof Sql)) { continue; }
		const {_template} = sql;
		// eslint-disable-next-line prefer-destructuring
		const f = _template[0];
		const t = _template.slice(1);
		if (f) { end.push(f); }
		if (!t.length) { continue; }
		template.push(end.join(' '));
		values.push(...sql._values);
		const last = t.pop();
		template.push(...t);
		end = last ? [last] : [];
	}
	template.push(end.join(' '));
	return [template, values];
}
