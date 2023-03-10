import type Sql from '.';
import defineProp from './defineProp';
import getId from './getId';
import Id from './Id';
import Field from './Field';

const Table: Sql.TableConstructor = function (
	this: any,
	table: string | Sql.Id,
	alias?: string | Sql.Id | boolean,
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
	if (alias instanceof Id){
		that.alias = alias.id;
	} else if (typeof alias === 'string') {
		that.alias = alias;
	} else {
		that.alias = '';
	}
	if (typeof alias === 'boolean') {
		that.global = alias;
	} else if (typeof global === 'boolean') {
		that.global = global;
	} else {
		that.global = false;
	}
	return that;
} as any;

defineProp(Table.prototype, 'toString', function(
	this: Sql.Table,
): string {
	const {table, alias } = this;
	if (!alias) { return getId(table); }
	return `${ getId(table) } AS ${ getId(alias) }`;
});

defineProp(Table.prototype, 'field', function(
	this: Sql.Table,
	field: string
): Sql.Field {
	return new Field(field, this);
});

defineProp(Table.prototype, 'transform', function(
	this: Sql.Table,
	transformer: Sql.Transformer,
): Sql.Table {
	const {table, alias, global} = this;
	const that = Object.create(Table.prototype) as Sql.Table;
	that.table = transformer(table, 'table', global);
	that.alias = alias && transformer(alias, 'alias');
	that.global = global;
	return that;
});

defineProp(Table.prototype, 'as', function(
	this: Sql.Table,
	alias: string,
): Sql.Table {
	const that = Object.create(Table.prototype) as Sql.Table;
	that.table = this.table;
	that.alias = alias || '';
	that.global = this.global;
	return that;
});

export default Table;
