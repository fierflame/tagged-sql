import type Sql from '.';
import defineProp from './defineProp';
import getId from './getId';
import Id from './Id';

const Table: Sql.TableConstructor = function (
	this: any,
	table: string | Sql.Id,
	global?: boolean,
): Sql.Table {
	const that = this instanceof Table
		? this as Sql.Table
		: Object.create(Table.prototype) as Sql.Table;
	if (table instanceof Id){
		that.table = table.id;
	} else {
		that.table = table;
	}
	that.global = global;
	return that;
} as any;
defineProp(Table.prototype, 'toString', function(
	this: Sql.Table,
): string {
	return getId(this.table);
});

defineProp(Table.prototype, 'transform', function(
	this: Sql.Table,
	transformer: Sql.Transformer,
): Sql.Table {
	const {table, global} = this;
	return Table(transformer(table, 'table', global), global);
});

export default Table;
