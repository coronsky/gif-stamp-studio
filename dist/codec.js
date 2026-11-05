export const WIDTH=320, HEIGHT=270, MAX_BYTES=1000000;
export function concat(parts){const out=new Uint8Array(parts.reduce((s,p)=>s+p.length,0));let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
const table=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(data){let c=0xffffffff;for(const b of data)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
const u32=n=>{const a=new Uint8Array(4);new DataView(a.buffer).setUint32(0,n);return a;};
function chunk(type,data){const name=new TextEncoder().encode(type),body=concat([name,data]);return concat([u32(data.length),body,u32(crc32(body))]);}
export function sampleIndices(durations,count){const sum=durations.reduce((a,b)=>a+b,0);let cursor=0,edge=durations[0];return Array.from({length:count},(_,i)=>{const t=i*sum/count;while(cursor<durations.length-1&&t>=edge){cursor++;edge+=durations[cursor];}return cursor;});}
// Full RGBA frames, no disposal, SOURCE blend; zlib stream per PNG frame.
export async function encodeAPNG(frames,seconds,loops){
 if(frames.length<5||frames.length>20||!Number.isInteger(seconds)||seconds<1||seconds>4||!Number.isInteger(loops)||loops<1||loops>4)throw Error('出力設定が範囲外です。');
 const first=frames[0],{width,height}=first;if(frames.some(f=>f.width!==width||f.height!==height))throw Error('フレームのサイズが一致しません。');
 if(!frames.some(f=>f.data.some((v,i)=>v!==first.data[i])))throw Error('すべてのフレームが同じ画像です。動きのあるGIFを選ぶか、フレーム数を変更してください。');
 const ihdr=new Uint8Array(13),h=new DataView(ihdr.buffer);h.setUint32(0,width);h.setUint32(4,height);ihdr[8]=8;ihdr[9]=6;
 const parts=[new Uint8Array([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('acTL',concat([u32(frames.length),u32(loops)]))];let sequence=0;
 for(let i=0;i<frames.length;i++){
  const fc=new Uint8Array(26),v=new DataView(fc.buffer);v.setUint32(0,sequence++);v.setUint32(4,width);v.setUint32(8,height);v.setUint16(20,seconds);v.setUint16(22,frames.length*loops);fc[24]=0;fc[25]=0;parts.push(chunk('fcTL',fc));
  const raw=new Uint8Array((width*4+1)*height);for(let row=0;row<height;row++)raw.set(frames[i].data.subarray(row*width*4,(row+1)*width*4),row*(width*4+1)+1);
  const stream=new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'));const compressed=new Uint8Array(await new Response(stream).arrayBuffer());
  parts.push(i===0?chunk('IDAT',compressed):chunk('fdAT',concat([u32(sequence++),compressed])));
 }
 parts.push(chunk('IEND',new Uint8Array()));return new Blob([concat(parts)],{type:'image/png'});
}
