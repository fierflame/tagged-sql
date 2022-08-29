标签化SQL TaggedSql
===================

用 ES 标签模板书写 sql 语句。

Writing sql statement with ES6 tagged template strings.

主要特征 Key features
---------------------

- 基于 ES 标签模板语法 ES6 tagged template strings based
- 支持给表名添加前缀 Supports adding prefixes to table names
- 书写简单 Simple writing

引入 Import
-----------

```js
import TaggedSql from 'tagged-sql';
// 或者 or
const TaggedSql = require('tagged-sql');
```

创建 Create
-----------

```js
const sql = TaggedSql`SELECT author FROM books WHERE name = ${book} AND author = ${author}`
```

链接 Link
---------

```js
const where = TaggedSql`WHERE name = ${book} AND author = ${author}`
const limit = TaggedSql`Limit 10`


const sql1 = TaggedSql`SELECT author FROM books ${where} ${limit}`;
// 或者 or
const sql2 = TaggedSql('SELECT author FROM books', where, limit);
```

独立的字段及数据表 Independent fields and tables
------------------------------------------------

```js
// 数据表 Sql table name
const bookTable = TaggedSql.Table('books');

// 字段名 Field name
const dateField = TaggedSql.Field('date');


// 字段，同时指定数据表 Field, and specify the data table
const nameField = TaggedSql.Field('name', 'books');

// 字段，同时指定数据表 Field, and specify the data table
const authorField = TaggedSql.Field('author', bookTable);


const bookSql = TaggedSql`SELECT ${dateField} FROM ${bookTable} WHERE ${nameField} = ${'Help Of TaggedSql'} AND ${authorField} = ${'NyLoong'}`;
```

查询 Query
----------

```js

// postgres: 
pg.query(bookSql.toString((_, i) => `$${ i + 1 }`), bookSql.values)
// 等价于 is equivalent to
pg.query(`SELECT "date" FROM "books" WHERE "books"."name" = $1 AND "books"."author" = $2`, ['Help Of TaggedSql', 'NyLoong'])

// mysql: 
mysql.query(bookSql.toString('?'), bookSql.values)
// 等价于 is equivalent to
mysql.query(`SELECT "date" FROM "books" WHERE "books"."name" = ? AND "books"."author" = ?`, ['Help Of TaggedSql', 'NyLoong'])
```

查询时添加表格前缀 Query with table prefix
------------------------------------------

```js
// postgres: 
pg.query(bookSql.toString((_, i) => `$${ i + 1 }`, 'tp_'), bookSql.values)
// 等价于 is equivalent to
pg.query(`SELECT "date" FROM "tp_books" WHERE "tp_books"."name" = $1 AND "tp_books"."author" = $2`, ['Help Of TaggedSql', 'NyLoong'])

// mysql: 
mysql.query(bookSql.toString('?', 'tp_'), bookSql.values)
// 等价于 is equivalent to
mysql.query(`SELECT "date" FROM "tp_books" WHERE "tp_books"."name" = ? AND "tp_books"."author" = ?`, ['Help Of TaggedSql', 'NyLoong'])
```
