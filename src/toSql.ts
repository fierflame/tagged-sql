import Sql from '.';
import isLike from './isLike';

export default function toSql<T = any>(
	v: T,
): T extends Sql.Like ? Sql : T {
	if (!isLike(v)) { return v as any; }
	const sql = v.toTaggedSql();
	if (sql instanceof Sql) {
		return sql as any;
	}
	return v as any;
}
