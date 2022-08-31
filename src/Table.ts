import type TaggedSql from '.';
import defineProp from './defineProp';
import getId from './getId';
import Id from './Id';
import isFunction from './isFunction';
import isString from './isString';


function Table(
	this: any, table: string | TaggedSql.Id, global?: boolean
): TaggedSql.Table {
	const that = this instanceof Table
		? this as TaggedSql.Table
		: Object.create(Table.prototype) as TaggedSql.Table;
	if (table instanceof Id){
		that.table = table.id;
	} else {
		that.table = table;
	}
	that.global = global;
	return that;
}
defineProp(Table.prototype, 'toString', function(
	this: TaggedSql.Table,
	...options: (string | TaggedSql.Transformer | undefined)[]
): string {
	let {table} = this;
	if (!this.global) {
		const prefix = options.find(isString) as string | undefined;
		if (isString(prefix)) {
			table = `${ prefix }${ table }`;
		}
	}
	const transformer = options.find(isFunction) as TaggedSql.Transformer | undefined;
	if (transformer) {
		table = transformer(table, 'table');
	}
	return getId(table);
});

export default Table as TaggedSql.TableConstructor;
