import type Sql from '.';
import Field from './Field';
import Id from './Id';
import Table from './Table';
export default function isIdLike(
	v: any,
): v is (Sql.Id | Sql.Table | Sql.Field) {
	return v instanceof Field || v instanceof Table || v instanceof Id;
}
