import fsFn from 'node:fs';

import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import {terser} from 'rollup-plugin-terser';

import info from './package.json';

const {
	name,  version, description, keywords, engines, dependencies,
	author, license, homepage, repository, bugs,
} = info;


const beginYear = 2022;
const year = new Date().getFullYear();

const banner = `\
/*!
 * ${ name } v${ version }
 * (c) ${ beginYear === year ? beginYear : `${ beginYear }-${ year }` } ${ author }
 * @license ${ license }
 */
`;

const extensions = ['.ts'];
const outputFile = 'TaggedSql';
fsFn.writeFileSync('dist/package.json', JSON.stringify({
	name, version,
	main: `${ outputFile }.cjs`,
	types: `${ outputFile }.d.ts`,
	module: `${ outputFile }.mjs`,
	browser: `${ outputFile }.min.js`,
	unpkg: `${ outputFile }.js`,
	jsdelivr: `${ outputFile }.js`,
	dependencies, engines,
	description, keywords, author, license, homepage, repository, bugs,
	exports: {
		'.': {
			node: `./${ outputFile }.cjs`,
			types: `./${ outputFile }.d.ts`,
			module: `./${ outputFile }.mjs`,
			browser: `./${ outputFile }.min.js`,
			unpkg: `./${ outputFile }.js`,
			jsdelivr: `./${ outputFile }.js`,
		},
		'./package.json': './package.json',
	},
}, null, 2));
const input = 'src/index.ts';
const output = `dist/${ outputFile }`;
export default [
	{
		input,
		output: [
			{ format: 'cjs', file: `${ output }.cjs` },
			{ format: 'esm', file: `${ output }.mjs` },
			{ format: 'esm', file: `${ output }.min.mjs`, plugins: [terser()] },
			{ format: 'umd', file: `${ output }.js` },
			{ format: 'umd', file: `${ output }.min.js`,  plugins: [terser()] },
		].map(v => ({banner, exports: 'default', name: 'TaggedSql', ...v})),
		plugins: [
			resolve({ extensions }),
			babel({ extensions, plugins: ['@babel/plugin-transform-typescript'] }),
			replace({
				preventAssignment: true,
				values:{__VERSION__: version,
				},
			}),
		],
	}, {
		input,
		output: { file: `${ output }.d.ts`, format: 'esm', banner },
		plugins: [ dts() ],
	},
];
