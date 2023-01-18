#!/bin/env node
import assert from 'node:assert';
import test from 'node:test';
import Sql from 'tagged-sql';
test('参数形式创建 sql 对象', async t => {
	const sql = Sql('SElECT ', '"name"', 'FROM', '"table"');
	await t.test('模板', () => assert.deepStrictEqual(
		sql._template,
		['SElECT "name" FROM "table"']
	));
	await t.test('内容', () => assert.deepStrictEqual(
		sql._values,
		[]
	));
});
test('用标签模板创建 sql 对象', async t => {
	const sql = Sql`  SELECT  * FROM "table" WHERE "a" = ${ 1 } AND "b" > 2 OR "c" < ${ '2' }`;
	await t.test('模板', () => assert.deepStrictEqual(
		sql._template,
		['SELECT  * FROM "table" WHERE "a" =', 'AND "b" > 2 OR "c" <', '']
	));
	await t.test('内容', () => assert.deepStrictEqual(
		sql._values,
		[1, '2']
	));
});

const table = Sql.Table('tableBooks');
const gTable = Sql.Table('tableUsers', true);

const nf1 = Sql.Field('mainName');
const nf2 = Sql.Field('mainAuthor');
const f1 = Sql.Field('a', table);
const f2 = Sql.Field('c', 'tableGroups');
const gf1 = Sql.Field('a', 'tableRoles', true);
const gf2 = Sql.Field('c', gTable);

test('参数形式连接 sql', async t => {
	const sql = Sql('SELECT ', nf1, ',', nf2, ',', f1, ',', f2, ',', gf1, ',', gf2, Sql` FROM `, table, 'WHERE ', Sql`"a" = ${ 1 } AND "b" > 2`, 'OR ', Sql`"c" < ${ '2' }`, ' AND "d" > 3');
	await t.test('模板', () => assert.deepStrictEqual(
		sql._template,
		['SELECT', ',', ',', ',', ',', ',', 'FROM', 'WHERE "a" =', 'AND "b" > 2 OR "c" <', 'AND "d" > 3']
	));
	await t.test('内容', () => assert.deepStrictEqual(
		sql._values,
		[nf1, nf2, f1, f2, gf1, gf2, table, 1, '2']
	));
});

test('用标签模板连接 sql', async t => {
	const sql = Sql`SELECT${ nf1 }, ${ nf2 }, ${ f1 }, ${ f2 }, ${ gf1 },${ gf2 } ${ Sql`FROM ${ table }  ` } JOIN ${ gTable } WHERE ${ Sql`"a" = ${ 1 } AND "b" > 2` } OR ${ Sql`"c" < ${ '2' }` }`;
	await t.test('模板', () => assert.deepStrictEqual(
		sql._template,
		['SELECT', ',', ',', ',', ',', ',', 'FROM', 'JOIN', 'WHERE "a" =', 'AND "b" > 2 OR "c" <', '']
	));
	await t.test('内容', () => assert.deepStrictEqual(
		sql._values,
		[nf1, nf2, f1, f2, gf1, gf2, table, gTable, 1, '2']
	));
});

test('sql 转字符串', async t => {
	const sql = Sql`SELECT${ nf1 }, ${ nf2 }, ${ f1 }, ${ f2 }, ${ gf1 },${ gf2 } ${ Sql`FROM ${ table }   ` } JOIN ${ gTable } WHERE ${ Sql`"a" = ${ 1 } AND "b" > 2` } OR ${ Sql`"c" < ${ '2' }` }AND "d" > 3`;
	await t.test('模板', () => assert.deepStrictEqual(
		[
			sql.toString('?'),
			sql.toString((_, i) => `$${ i + 1 }`),
			sql.transform(v => v.replace(/([A-Z])/g, '_$1').toLowerCase()).toString('?'),
			sql.transform(v => v.replace(/([A-Z])/g, '_$1').toLowerCase()).toString((_, i) => `$${ i + 1 }`),
		],
		[
			'SELECT "mainName" , "mainAuthor" , "tableBooks"."a" , "tableGroups"."c" , "tableRoles"."a" , "tableUsers"."c" FROM "tableBooks" JOIN "tableUsers" WHERE "a" = ? AND "b" > 2 OR "c" < ? AND "d" > 3',
			'SELECT "mainName" , "mainAuthor" , "tableBooks"."a" , "tableGroups"."c" , "tableRoles"."a" , "tableUsers"."c" FROM "tableBooks" JOIN "tableUsers" WHERE "a" = $1 AND "b" > 2 OR "c" < $2 AND "d" > 3',
			'SELECT "main_name" , "main_author" , "table_books"."a" , "table_groups"."c" , "table_roles"."a" , "table_users"."c" FROM "table_books" JOIN "table_users" WHERE "a" = ? AND "b" > 2 OR "c" < ? AND "d" > 3',
			'SELECT "main_name" , "main_author" , "table_books"."a" , "table_groups"."c" , "table_roles"."a" , "table_users"."c" FROM "table_books" JOIN "table_users" WHERE "a" = $1 AND "b" > 2 OR "c" < $2 AND "d" > 3',
		],
	));
	await t.test('模板(默认)，带表格前缀', () => assert.deepStrictEqual(
		[
			sql.transform((v, t, g) => t !== 'table' || g ? v : `tp_${ v }`).toString('?'),
			sql.transform((v, t, g) => t !== 'table' || g ? v : `tp_${ v }`).toString((_, i) => `$${ i + 1 }`),
			sql.transform((v, t, g) => (t !== 'table' || g ? v : `tp_${ v }`).replace(/([A-Z])/g, '_$1').toLowerCase()).toString('?'),
			sql.transform((v, t, g) => (t !== 'table' || g ? v : `tp_${ v }`).replace(/([A-Z])/g, '_$1').toLowerCase()).toString((_, i) => `$${ i + 1 }`),
		],
		[
			'SELECT "mainName" , "mainAuthor" , "tp_tableBooks"."a" , "tp_tableGroups"."c" , "tableRoles"."a" , "tableUsers"."c" FROM "tp_tableBooks" JOIN "tableUsers" WHERE "a" = ? AND "b" > 2 OR "c" < ? AND "d" > 3',
			'SELECT "mainName" , "mainAuthor" , "tp_tableBooks"."a" , "tp_tableGroups"."c" , "tableRoles"."a" , "tableUsers"."c" FROM "tp_tableBooks" JOIN "tableUsers" WHERE "a" = $1 AND "b" > 2 OR "c" < $2 AND "d" > 3',
			'SELECT "main_name" , "main_author" , "tp_table_books"."a" , "tp_table_groups"."c" , "table_roles"."a" , "table_users"."c" FROM "tp_table_books" JOIN "table_users" WHERE "a" = ? AND "b" > 2 OR "c" < ? AND "d" > 3',
			'SELECT "main_name" , "main_author" , "tp_table_books"."a" , "tp_table_groups"."c" , "table_roles"."a" , "table_users"."c" FROM "tp_table_books" JOIN "table_users" WHERE "a" = $1 AND "b" > 2 OR "c" < $2 AND "d" > 3',
		],
	));
	await t.test('内容', () => assert.deepStrictEqual(
		sql.values,
		[1, '2']
	));
});
