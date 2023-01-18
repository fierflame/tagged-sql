import defineGetter from './defineGetter';
import defineProp from './defineProp';
import Field from './Field';
import Id from './Id';
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
	return _values.filter(v => !(v instanceof TaggedSql.Field || v instanceof TaggedSql.Table || v instanceof TaggedSql.Id));
});
defineGetter(TaggedSql.prototype, 'isNull', function({_template}) {
	return _template.length === 1 && /^\s*$/.test(_template[0]);
});
defineProp(TaggedSql.prototype, 'toString', function(
	this: TaggedSql,
	separator?: TaggedSql.Separator,
) {
	const { _values} = this;
	// eslint-disable-next-line prefer-destructuring
	const first = this._template[0];
	const others = this._template.slice(1);
	const template: string[] = [first];

	for (let i = 0; i < others.length; i++) {
		const v = _values[i];
		const it = others[i];
		if (!(v instanceof Field || v instanceof Table || v instanceof Id)) {
			template.push(it);
			continue;
		}
		template.push(
			[template.pop(), v.toString(), it].filter(Boolean).join(' '),
		);
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
defineProp(TaggedSql.prototype, 'transform', function(
	this: TaggedSql,
	transformer: TaggedSql.Transformer
) {
	const { _values, _template } = this;
	const sql = Object.create(TaggedSql.prototype) as TaggedSql;
	defineProp(sql, '_template', [..._template]);
	defineProp(sql, '_values', _values.map(v => {
		if (v instanceof Id || v instanceof Field || v instanceof Table) {
			return v.transform(transformer);
		}
		return v;
	}));
	return sql;
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
defineProp(TaggedSql, 'Id', Id);
defineProp(TaggedSql, 'Table', Table);
defineProp(TaggedSql, 'version', '__VERSION__');
interface TaggedSql extends TaggedSql.Like {
	readonly _template: readonly string[];
	readonly _values: readonly any[];
	readonly values: readonly any[];
	readonly isNull: boolean;
	transform(this: TaggedSql, transformer: TaggedSql.Transformer): TaggedSql;
	toString(this: TaggedSql, separator?: TaggedSql.Separator): string;
	glue(this: TaggedSql, ...list: TaggedSql.Item[]): TaggedSql;
}
declare namespace TaggedSql {
	export interface Like {
		toTaggedSql(this: this): TaggedSql;
	}
	export type Item =
		| string
		| number
		| TaggedSql.Like
		| TaggedSql.Id
		| TaggedSql.Field
		| TaggedSql.Table
		| undefined;
	export interface Constructor {
		(...list: Item[]): TaggedSql;
		(sql: string[] | TemplateStringsArray, ...values: any[]): TaggedSql;
		new(...list: Item[]): TaggedSql;
		new(sql: string[] | TemplateStringsArray, ...values: any[]): TaggedSql;
		prototype: TaggedSql;
		Field: FieldConstructor;
		Table: TableConstructor;
		Id: IdConstructor;
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
		transform(transformer: Transformer): Field;
		toString(): string;
	}
	export interface TableConstructor {
		(table: string, global?: boolean): Table;
		new (table: string, global?: boolean): Table;
		prototype: Table;
	}
	export interface Table {
		table: string;
		global?: boolean;
		transform(transformer: Transformer): Table;
		toString(): string;
	}
	export interface IdConstructor {
		(id: string, group?: string): Id;
		new (id: string, group?: string): Id;
		prototype: Id;
	}
	export interface Id {
		id: string;
		group?: string;
		transform(transformer: Transformer): Id;
		toString(): string;
	}
	export interface Transformer {
		(id: string, group?: string, global?: boolean): string

	}
	export interface SeparatorFn {
		(value: any, index: number): string
	}
	export type Separator = string | SeparatorFn;
}
export default TaggedSql;
