import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const port=Number(process.env.PORT||4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
http.createServer(async (req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    if(url.pathname==='/__responsive'){
      const width=Math.min(1440,Math.max(320,Number(url.searchParams.get('width'))||390));
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
      res.end(`<!doctype html><html><head><title>ByeBye responsive layout check</title><style>body{margin:0;padding:20px;background:#e8e9e4;font:14px system-ui}p{margin:0 0 12px}iframe{display:block;width:${width}px;height:calc(100vh - 72px);border:1px solid #c5cabf;background:#fcf9f3}</style></head><body><p>ByeBye preview · ${width}px viewport</p><iframe title="ByeBye responsive preview" src="/byebye-budget-trips/"></iframe></body></html>`);return;
    }
    const route=url.pathname.replace(/^\/byebye-budget-trips(?=\/|$)/,'')||'/';
    const filename=path.resolve(root,'.'+decodeURIComponent(route==='/'?'/index.html':route));
    if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const data=await fs.readFile(filename);res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
