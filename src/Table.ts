import type TaggedSql from '.';
import defineProp from './defineProp';
import getId from './getId';
import Id from './Id';


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
defineProp(Table.prototype as TaggedSql.Table, 'toString', function(
	this: TaggedSql.Table,
): string {
	return getId(this.table);
});

defineProp(Table.prototype as TaggedSql.Table, 'transform', function(
	this: TaggedSql.Table,
	transformer: TaggedSql.Transformer,
): TaggedSql.Table {
	const {table, global} = this;
	return Table(transformer(table, 'table', global), global);
});

export default Table as TaggedSql.TableConstructor;
