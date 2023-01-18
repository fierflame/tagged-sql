import type TaggedSql from '.';
import defineProp from './defineProp';
import getId from './getId';
import Id from './Id';
import Table from './Table';


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
defineProp(Field.prototype as TaggedSql.Field, 'toString', function(
	this: TaggedSql.Field,
): string {
	const {table, field} = this;
	return table ? `${ getId(table) }.${ getId(field) }` : getId(field);
});

defineProp(Table.prototype as TaggedSql.Field, 'transform', function (
	this: TaggedSql.Field,
	transformer: TaggedSql.Transformer,
): TaggedSql.Field {
	const { field, table, global } = this;
	return Field(
		transformer(field, 'field'),
		table ? transformer(table, 'table', global) : undefined,
		global,
	);
});
export default Field as TaggedSql.FieldConstructor;
