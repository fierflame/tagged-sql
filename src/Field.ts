import type TaggedSql from '.';

const getId = (id: string) => `"${ id.replace(/"/g, '""') }"`;

function Field(
	this: any, field: string, table?: string, global?: boolean
): TaggedSql.Field {
	const that = this instanceof Field
		? this as TaggedSql.Field
		: Object.create(Field.prototype) as TaggedSql.Field;
	that.field = field;
	that.table = table;
	that.global = global;
	return that;

}

Reflect.defineProperty(Field.prototype, 'toString', {
	value(this: TaggedSql.Field, prefix?: string): string {
		const {table} = this;
		const field = getId(this.field);
		if (!table) { return field; }
		const tableName = !this.global && prefix ? `${ prefix }${ table }` : table;
		return `${ getId(tableName) }.${ field }`;
	},
	configurable: true,
	writable: true,
});

export default Field as TaggedSql.FieldConstructor;
