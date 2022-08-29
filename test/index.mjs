#!/bin/env node
import assert from 'node:assert';
import test from 'test';
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

const table = Sql.Table('b');
const gTable = Sql.Table('d', true);

const nf1 = Sql.Field('a');
const nf2 = Sql.Field('c');
const f1 = Sql.Field('a', table);
const f2 = Sql.Field('c', 'd');
const gf1 = Sql.Field('a', 'b', true);
const gf2 = Sql.Field('c', gTable, true);

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
	await t.test('模板(默认)', () => assert.deepStrictEqual(
		sql.toString(),
		'SELECT "a" , "c" , "b"."a" , "d"."c" , "b"."a" , "d"."c" FROM "b" JOIN "d" WHERE "a" = ? AND "b" > 2 OR "c" < ? AND "d" > 3'
	));
	await t.test('模板(函数)', () => assert.deepStrictEqual(
		sql.toString((_, i) => `$${ i + 1 }`),
		'SELECT "a" , "c" , "b"."a" , "d"."c" , "b"."a" , "d"."c" FROM "b" JOIN "d" WHERE "a" = $1 AND "b" > 2 OR "c" < $2 AND "d" > 3'
	));
	await t.test('模板(默认)，带表格前缀', () => assert.deepStrictEqual(
		sql.toString('?', 'tp_'),
		'SELECT "a" , "c" , "tp_b"."a" , "tp_d"."c" , "b"."a" , "d"."c" FROM "tp_b" JOIN "d" WHERE "a" = ? AND "b" > 2 OR "c" < ? AND "d" > 3'
	));
	await t.test('模板(函数)，带表格前缀', () => assert.deepStrictEqual(
		sql.toString((_, i) => `$${ i + 1 }`, 'tp_'),
		'SELECT "a" , "c" , "tp_b"."a" , "tp_d"."c" , "b"."a" , "d"."c" FROM "tp_b" JOIN "d" WHERE "a" = $1 AND "b" > 2 OR "c" < $2 AND "d" > 3'
	));
	await t.test('内容', () => assert.deepStrictEqual(
		sql.values,
		[1, '2']
	));
});
