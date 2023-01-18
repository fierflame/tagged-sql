import defineGetter from './defineGetter';
import defineProp from './defineProp';
import Field from './Field';
import Id from './Id';
import isIdLike from './isIdLike';
import link from './link';
import parse from './parse';
import Table from './Table';

function getTemplate(v: string[] | TemplateStringsArray) {
	return 'raw' in v && Array.isArray(v.raw) ? v.raw : v;
}

const Sql: Sql.Constructor = function (
	this: any,
	...args: any[]
): Sql {
	const sql = this instanceof Sql
		? this
		: Object.create(Sql.prototype) as Sql;
	const result: [string[], any[]] =
		Array.isArray(args[0])
			? parse(getTemplate(args[0]), args.slice(1))
			: args.length ? link(args) : [[''], []];
	defineProp(sql, '_template', result[0]);
	defineProp(sql, '_values', result[1]);
	return sql;
} as any;
defineGetter(Sql.prototype, 'values', function ({_values}) {
	return _values.filter(v => !isIdLike(v));
});
defineGetter(Sql.prototype, 'isNull', function({_template}) {
	return _template.length === 1 && /^\s*$/.test(_template[0]);
});
defineProp(Sql.prototype, 'toString', function(
	this: Sql,
	separator?: Sql.Separator,
) {
	const { _values} = this;
	const others = this._template.slice(1);
	const template: string[] = [this._template[0]];

	for (let i = 0; i < others.length; i++) {
		const v = _values[i];
		const it = others[i];
		if (!isIdLike(v)) {
			template.push(it);
			continue;
		}
		template.push(
			[
				template.pop(), v.toString(), it,
			].filter(Boolean).join(' '),
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
defineProp(Sql.prototype, 'transform', function(
	this: Sql,
	transformer: Sql.Transformer,
) {
	const { _values, _template } = this;
	const sql = Object.create(Sql.prototype) as Sql;
	defineProp(sql, '_template', [..._template]);
	defineProp(sql, '_values', _values.map(v => {
		if (isIdLike(v)) {
			return v.transform(transformer);
		}
		return v;
	}));
	return sql;
});
defineProp(Sql.prototype, 'glue', function(...list) {
	for (let i = list.length - 1; i > 0; i--) {
		list.splice(i, 0, this);
	}
	return Sql('', ...list);
});
defineProp(Sql.prototype, 'toTaggedSql', function() {
	return this;
});
defineProp(Sql, 'Field', Field);
defineProp(Sql, 'Id', Id);
defineProp(Sql, 'Table', Table);
defineProp(Sql, 'version', '__VERSION__');
interface Sql extends Sql.Like {
	readonly _template: readonly string[];
	readonly _values: readonly any[];
	readonly values: readonly any[];
	readonly isNull: boolean;
	transform(this: Sql, transformer: Sql.Transformer): Sql;
	toString(this: Sql, separator?: Sql.Separator): string;
	glue(this: Sql, ...list: Sql.Item[]): Sql;
}
declare namespace Sql {
	export interface Like {
		toTaggedSql(this: this): Sql;
	}
	export type Item =
		| string
		| number
		| Like
		| Id
		| Field
		| Table
		| undefined;
	export interface Constructor {
		(...list: Item[]): Sql;
		(
			sql: string[] | TemplateStringsArray,
			...values: any[]
		): Sql;
		new(...list: Item[]): Sql;
		new(
			sql: string[] | TemplateStringsArray,
			...values: any[]
		): Sql;
		prototype: Sql;
		Field: FieldConstructor;
		Table: TableConstructor;
		Id: IdConstructor;
		version: string;
	}
	export interface FieldConstructor {
		(
			field: string,
			table?: string | Table,
			global?: boolean,
		): Field;
		new(
			field: string,
			table?: string,
			global?: boolean,
		): Field;
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
		new(table: string, global?: boolean): Table;
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
		new(id: string, group?: string): Id;
		prototype: Id;
	}
	export interface Id {
		id: string;
		group?: string;
		transform(transformer: Transformer): Id;
		toString(): string;
	}
	export interface Transformer {
		(
			id: string,
			group?: string,
			global?: boolean,
		): string

	}
	export interface SeparatorFn {
		(value: any, index: number): string
	}
	export type Separator = string | SeparatorFn;
}
export default Sql;
