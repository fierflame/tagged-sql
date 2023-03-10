import type Sql from '.';
import defineProp from './defineProp';
import getId from './getId';
import Id from './Id';
import Table from './Table';

const Field: Sql.FieldConstructor = function (
	this: any,
	field: string | Sql.Id,
	table?: string | Sql.Table | Sql.Id,
	global?: boolean
): Sql.Field {
	const that = this instanceof Field
		? this as Sql.Field
		: Object.create(Field.prototype) as Sql.Field;
	if (field instanceof Id){
		that.field = field.id;
	} else {
		that.field = field;
	}
	if (table instanceof Table){
		const { alias } = table;
		if (alias) {
			that.table = alias;
			that.alias = true;
		} else {
			that.table = table.table;
		}
		that.global = typeof global === 'boolean'
			? global
			: table.global;
	} else if (table instanceof Id){
		that.table = table.id;
		that.global = global;
		if (table.group === 'alias') {
			this.alias = true;
		}
	} else {
		that.table = table;
		that.global = global;
	}
	return that;
} as any;

defineProp(Field.prototype, 'toString', function(
	this: Sql.Field,
): string {
	const {table, field} = this;
	return table ? `${ getId(table) }.${ getId(field) }` : getId(field);
});

defineProp(Field.prototype, 'transform', function(
	this: Sql.Field,
	transformer: Sql.Transformer,
): Sql.Field {
	const { field, table, alias, global } = this;
	const that = Object.create(Field.prototype) as Sql.Field;
	that.field = transformer(field, 'field');
	that.alias = alias;
	if (!table) { return that; }
	if (alias) {
		that.table = transformer(table, 'alias');
	} else {
		that.table = transformer(table, 'table', global);
	}
	that.global = global;
	return that;
});

export default Field;
