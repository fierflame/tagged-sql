import type TaggedSql from '.';
import defineProp from './defineProp';
import getId from './getId';
import Id from './Id';
import isFunction from './isFunction';
import isString from './isString';
import  Table from './Table';


function Field(
	this: any, field: string | TaggedSql.Id, table?: string | TaggedSql.Table | TaggedSql.Id, global?: boolean
): TaggedSql.Field {
	const that = this instanceof Field
		? this as TaggedSql.Field
		: Object.create(Field.prototype) as TaggedSql.Field;
	if (field instanceof Id){
		that.field = field.id;
	} else {
		that.field = field;
	}
	if (table instanceof Table){
		that.table = table.table;
		that.global = typeof global === 'boolean' ? global : table.global;
	} else if (table instanceof Id){
		that.table = table.id;
		that.global = global;
	} else {
		that.table = table;
		that.global = global;
	}
	return that;

}
defineProp(Field.prototype, 'toString', function(
	this: TaggedSql.Field,
	...options: (string | TaggedSql.Transformer | undefined)[]
): string {
	let {table, field} = this;
	if (table && !this.global) {
		const prefix = options.find(isString) as string | undefined;
		if (prefix) {
			table = `${ prefix }${ table }`;
		}
	}
	const transformer = options.find(isFunction) as TaggedSql.Transformer | undefined;
	if (transformer) {
		field = transformer(field, 'field');
		if (table) { table = transformer(table, 'table'); }
	}
	return table ? `${ getId(table) }.${ getId(field) }` : getId(field);
});

export default Field as TaggedSql.FieldConstructor;
