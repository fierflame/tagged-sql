import defineGetter from './defineGetter';
import defineProp from './defineProp';
import Field from './Field';
import link from './link';
import parse from './parse';
import Table from './Table';

function getTemplate(v: string[] | TemplateStringsArray) {
	return 'raw' in v && Array.isArray(v.raw) ? v.raw : v;
}

const TaggedSql: TaggedSql.Constructor = function (
	this: any,
	...args: any[]
): TaggedSql {
	const sql = this instanceof TaggedSql
		? this
		: Object.create(TaggedSql.prototype) as TaggedSql;
	const result: [string[], any[]] =
		Array.isArray(args[0])
			? parse(getTemplate(args[0]), args.slice(1))
			: args.length ? link(args) : [[''],  []];
	defineProp(sql, '_template', result[0]);
	defineProp(sql, '_values', result[1]);
	return sql;
} as any;
defineGetter(TaggedSql.prototype, 'values', function ({_values}) {
	return _values.filter(v => !(v instanceof TaggedSql.Field || v instanceof TaggedSql.Table));
});
defineGetter(TaggedSql.prototype, 'isNull', function({_template}) {
	return _template.length === 1 && /^\s*$/.test(_template[0]);
});
defineProp(TaggedSql.prototype, 'toString', function(separator, prefix) {
	const {_template: [first, ...others], _values} = this;
	const template: string[] = [first];
	for (let i = 0; i < others.length; i++) {
		const v = _values[i];
		const it = others[i];
		if (!(v instanceof TaggedSql.Field || v instanceof TaggedSql.Table)) {
			template.push(it);
			continue;
		}
		const t = [template.pop(), v.toString(prefix), it].filter(Boolean);
		template.push(t.join(' '));
	}
	if (typeof separator !== 'function') {
		return template.join(` ${ separator || '?' } `);
	}
	const strings: string[] = [template[0]];
	const {values} = this;
	for (let i = 1; i < template.length; i++) {
		const k = i - 1;
		strings.push(separator(values[k], k), template[i]);
	}
	return strings.join(' ');
});
defineProp(TaggedSql.prototype, 'glue', function(...list) {
	for (let i = list.length - 1; i > 0; i--) {
		list.splice(i, 0, this);
	}
	return TaggedSql('', ...list);
});
defineProp(TaggedSql.prototype, 'toTaggedSql', function() {
	return this;
});
defineProp(TaggedSql, 'Field', Field);
defineProp(TaggedSql, 'Table', Table);
defineProp(TaggedSql, 'version', '__VERSION__');
interface TaggedSql extends TaggedSql.Like {
	readonly _template: readonly string[];
	readonly _values: readonly any[];
	readonly values: readonly any[];
	readonly isNull: boolean;
	toString(
		this: TaggedSql,
		separator?: TaggedSql.Separator,
		tablePrefix?: string,
	): string;
	glue(
		this: TaggedSql,
		...list: (TaggedSql.Like | string | TaggedSql.Field | TaggedSql.Table)[]
	): TaggedSql;
}
declare namespace TaggedSql {
	export interface Like {
		toTaggedSql(this: this): TaggedSql;
	}
	export interface Constructor {
		(...list: (TaggedSql.Like | string | TaggedSql.Field | TaggedSql.Table)[]): TaggedSql;
		(sql: string[] | TemplateStringsArray, ...values: any[]): TaggedSql;
		new(...list: (TaggedSql.Like | string | TaggedSql.Field | TaggedSql.Table)[]): TaggedSql;
		new(sql: string[] | TemplateStringsArray, ...values: any[]): TaggedSql;
		prototype: TaggedSql;
		Field: FieldConstructor;
		Table: TableConstructor;
		version: string;
	}
	export interface FieldConstructor {
		(field: string, table?: string | TaggedSql.Table, global?: boolean): Field;
		new (field: string, table?: string, global?: boolean): Field;
		prototype: Field;
	}
	export interface Field {
		field: string;
		table?: string;
		global?: boolean;
		toString(tablePrefix?: string): string;
	}
	export interface TableConstructor {
		(table: string, global?: boolean): Table;
		new (table: string, global?: boolean): Table;
		prototype: Table;
	}
	export interface Table {
		table: string;
		global?: boolean;
		toString(prefix?: string): string;
	}
	export interface SeparatorFn {
		(value: any, index: number): string
	}
	export type Separator = string | SeparatorFn;
}
export default TaggedSql;
