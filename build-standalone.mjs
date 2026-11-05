import {readFile,writeFile} from 'node:fs/promises';
const base=new URL('./',import.meta.url);
const html=await readFile(new URL('dist/index.html',base),'utf8');
const css=await readFile(new URL('dist/style.css',base),'utf8');
const strip=source=>source.replace(/^\uFEFF/g,'').replace(/^import[^\n]*\n/gm,'').replace(/export \{[^}]*\};?/g,'').replace(/\bexport /g,'');
const modules=await Promise.all(['vendor/omggif.js','gif.js','codec.js','app.js'].map(async path=>strip(await readFile(new URL('dist/'+path,base),'utf8'))));
// Callback replacements preserve literal dollar signs in the embedded source.
const standalone=html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="app.js"></script>',()=>`<script type="module">${modules.join('\n')}</script>`);
await writeFile(new URL('GIF-Stamp-Studio.html',base),standalone);
await writeFile(new URL('index.html',base),standalone);
console.log('Created GIF-Stamp-Studio.html and index.html');
