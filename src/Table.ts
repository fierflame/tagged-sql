import type TaggedSql from '.';

const getId = (id: string) => `"${ id.replace(/"/g, '""') }"`;

function Table(
	this: any, table: string, global?: boolean
): TaggedSql.Table {
	const that = this instanceof Table
		? this as TaggedSql.Table
		: Object.create(Table.prototype) as TaggedSql.Table;
	that.table = table;
	that.global = global;
	return that;
}

Reflect.defineProperty(Table.prototype, 'toString', {
	value(this: TaggedSql.Table, prefix?: string): string {
		const table = !this.global && prefix
			? `${ prefix }${ this.table }`
			: this.table;
		return `${ getId(table) }`;
	},
	configurable: true,
	writable: true,
});

export default Table as TaggedSql.TableConstructor;
