import {readFile,writeFile} from 'node:fs/promises';
const base=new URL('./',import.meta.url);
const html=await readFile(new URL('dist/index.html',base),'utf8');
const css=await readFile(new URL('dist/style.css',base),'utf8');
const codec=(await readFile(new URL('dist/codec.js',base),'utf8')).replaceAll('export ','');
const app=(await readFile(new URL('dist/app.js',base),'utf8')).replace(/^\uFEFF?import[^\n]*\n/,'');
const standalone=html.replace('<link rel="stylesheet" href="style.css">',`<style>${css}</style>`).replace('<script type="module" src="app.js"></script>',`<script type="module">${codec}\n${app}</script>`);
await writeFile(new URL('GIF-Stamp-Studio.html',base),standalone);
await writeFile(new URL('index.html',base),standalone);
console.log('Created GIF-Stamp-Studio.html and index.html');

