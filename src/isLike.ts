import type Sql from '.';

export default function isLike(v: any): v is Sql.Like {
	if (!v) { return false; }
	if (typeof v !== 'object' && typeof v !== 'function') { return false; }
	return typeof v.toTaggedSql === 'function';
}
