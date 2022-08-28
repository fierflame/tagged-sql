import Sql from '.';

export default function toSql<T = any>(v: T): T extends Sql.Like ? Sql : T{
	if (!v) { return v as any; }
	if (typeof v !== 'object') { return v as any; }
	if (typeof (v as any).toTaggedSql !== 'function') { return v as any; }
	const sql = (v as any).toTaggedSql();
	if (sql instanceof Sql) {
		return sql as any;
	}
	return v as any;
}
