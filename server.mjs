import http from 'node:http';
import {readFile} from 'node:fs/promises';
const root=new URL('./dist/',import.meta.url);
http.createServer(async(req,res)=>{try{const name=new URL(req.url,'http://localhost').pathname;const path=name==='/'?'index.html':name.slice(1);if(!['index.html','app.js','codec.js','gif.js','vendor/omggif.js','style.css'].includes(path)){res.writeHead(404).end();return;}const data=await readFile(new URL(path,root));res.writeHead(200,{'Content-Type':path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(data);}catch{res.writeHead(500).end('Server error');}}).listen(4317,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4317'));
