import {WIDTH,HEIGHT,MAX_BYTES,sampleIndices,encodeAPNG} from './codec.js';
import {decodeGifFrames} from './gif.js';
const $=id=>document.getElementById(id),canvas=()=>Object.assign(document.createElement('canvas'),{width:WIDTH,height:HEIGHT});
let source=[],durations=[],rendered=[],playing=true,start=performance.now(),selected=-1,downloadURL=null,revision=0,loadRevision=0,busy=false,loading=false;
function status(message,error=false){$('status').textContent=message;$('fileStatus').textContent=message;$('fileStatus').classList.toggle('error',error);$('status').classList.toggle('error',error);}
function invalidate(){revision++;if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=null;$('download').hidden=true;$('checkSize').textContent='書き出し時に確認';$('sizeCheck').firstElementChild.textContent='○';}
function refresh(){
 invalidate();const count=Number($('frames').value),seconds=Number($('duration').value),loops=Number($('loops').value),scale=Number($('scale').value)/100;
 $('framesValue').textContent=count;$('scaleValue').textContent=Math.round(scale*100)+'%';$('checkFrames').textContent=count+'枚';$('checkTime').textContent=seconds+'秒 / '+loops+'回';$('previewInfo').textContent=`${count} frames / ${(seconds/loops).toFixed(2)} sec × ${loops}`;$('bgOptions').hidden=!$('removeBg').checked;
 if(!source.length)return;
 const indices=sampleIndices(durations,count),color=$('bgColor').value.match(/\w\w/g).map(x=>parseInt(x,16)),tolerance=Number($('tolerance').value);
 rendered=indices.map(index=>{const c=canvas(),ctx=c.getContext('2d',{willReadFrequently:true}),src=source[index],factor=Math.min((WIDTH-20)/src.width,(HEIGHT-20)/src.height)*scale,w=src.width*factor,h=src.height*factor;ctx.drawImage(src,(WIDTH-w)/2,(HEIGHT-h)/2,w,h);
 if($('removeBg').checked){const img=ctx.getImageData(0,0,WIDTH,HEIGHT),d=img.data;for(let p=0;p<d.length;p+=4){if(Math.hypot(d[p]-color[0],d[p+1]-color[1],d[p+2]-color[2])<=tolerance){d[p]=d[p+1]=d[p+2]=d[p+3]=0;}}ctx.putImageData(img,0,0);}return c;});
 $('timeline').replaceChildren(...rendered.map((frame,i)=>{const button=document.createElement('button'),thumb=canvas(),label=document.createElement('span');button.className='frame';button.setAttribute('aria-label',`フレーム${i+1}を確認`);thumb.getContext('2d').drawImage(frame,0,0);label.textContent=String(i+1).padStart(2,'0');button.append(thumb,label);button.onclick=()=>{playing=false;selected=i;updatePlay();draw(i);};return button;}));start=performance.now();selected=-1;status('調整を反映しました。APNGを作成して容量を確認できます。');
}
let lastDraw=-1;
function draw(i){if(!rendered[i])return;for(const id of ['preview','chatPreview']){const ctx=$(id).getContext('2d');ctx.clearRect(0,0,WIDTH,HEIGHT);ctx.drawImage(rendered[i],0,0);}Array.from($('timeline').children).forEach((node,n)=>node.classList.toggle('selected',n===i));lastDraw=i;}
function updatePlay(){$('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'プレビューを一時停止':'プレビューを再生');}
function tick(now){if(rendered.length){const cycle=Number($('duration').value)*1000/Number($('loops').value),index=playing?Math.floor(((now-start)%cycle)/cycle*rendered.length):Math.max(selected,0);draw(index);}requestAnimationFrame(tick);}
async function load(file){
 if(!file)return;const ticket=++loadRevision;invalidate();loading=true;$('export').disabled=true;status('GIFを読み込んでいます…');
 try{
  if(file.size>20*1024*1024)throw Error('20MB以下のGIFを選んでください。');
  const bytes=new Uint8Array(await file.arrayBuffer());if(ticket!==loadRevision)return;
  const frames=[],delays=[],scratch=document.createElement('canvas');
  for(const frame of decodeGifFrames(bytes)){
   if(ticket!==loadRevision)return;
   if(scratch.width!==frame.width||scratch.height!==frame.height){scratch.width=frame.width;scratch.height=frame.height;}
   scratch.getContext('2d').putImageData(new ImageData(frame.data,frame.width,frame.height),0,0);
   const ratio=Math.min(WIDTH/frame.width,HEIGHT/frame.height,1),c=Object.assign(document.createElement('canvas'),{width:Math.max(1,Math.round(frame.width*ratio)),height:Math.max(1,Math.round(frame.height*ratio))});
   c.getContext('2d').drawImage(scratch,0,0,c.width,c.height);frames.push(c);delays.push(frame.duration);
   if(frame.index%4===0){status('GIFを展開しています… '+(frame.index+1)+' / '+frame.count+'枚');await new Promise(resolve=>setTimeout(resolve,0));}
  }
  if(ticket!==loadRevision)return;source=frames;durations=delays;$('fileName').textContent=file.name;playing=true;updatePlay();refresh();status(file.name+' を読み込みました（'+frames.length+'枚）。');
 }catch(e){if(ticket===loadRevision)status(e.message+'（プレビューには前の素材を表示しています）',true);}finally{if(ticket===loadRevision){$('file').value='';loading=false;$('export').disabled=busy;}}
}
function demo(){loadRevision++;loading=false;$('export').disabled=busy;source=[];durations=[];for(let i=0;i<12;i++){const c=canvas(),x=c.getContext('2d'),bounce=Math.sin(i/12*Math.PI*2)*9;x.translate(160,153+bounce);x.lineWidth=4;x.strokeStyle='#34473b';x.fillStyle='#f3d397';x.beginPath();x.ellipse(0,31,57,56,0,0,Math.PI*2);x.fill();x.stroke();x.beginPath();x.moveTo(-53,-20);x.lineTo(-51,-65);x.lineTo(-23,-44);x.quadraticCurveTo(0,-56,25,-44);x.lineTo(53,-65);x.lineTo(55,-20);x.bezierCurveTo(72,48,-71,48,-53,-20);x.fill();x.stroke();x.fillStyle='#e9a3a1';for(const side of [-1,1]){x.beginPath();x.ellipse(side*35,6,11,7,0,0,Math.PI*2);x.fill();}x.lineCap='round';for(const side of [-1,1]){x.beginPath();x.arc(side*20,-8,7,Math.PI,2*Math.PI);x.stroke();}x.beginPath();x.moveTo(-7,9);x.quadraticCurveTo(0,19,7,9);x.stroke();x.fillStyle='#147d66';x.font='bold 29px Meiryo,sans-serif';x.textAlign='center';x.fillText('ありがとう',0,-89);x.strokeStyle='#34473b';x.beginPath();x.moveTo(-45,37);x.lineTo(-72,11-Math.sin(i/12*Math.PI*2)*12);x.moveTo(45,37);x.lineTo(72,11+Math.sin(i/12*Math.PI*2)*12);x.stroke();source.push(c);durations.push(100);}$('fileName').textContent='サンプル：ごきげんなねこ';playing=true;updatePlay();refresh();status('サンプルで書き出しを試せます。');}
$('file').onchange=e=>load(e.target.files[0]);$('drop').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('file').click();}});for(const event of ['dragenter','dragover'])$('drop').addEventListener(event,e=>{e.preventDefault();$('drop').classList.add('drag');});$('drop').addEventListener('dragleave',()=>$('drop').classList.remove('drag'));$('drop').addEventListener('drop',e=>{e.preventDefault();$('drop').classList.remove('drag');load(e.dataTransfer.files[0]);});
for(const id of ['frames','duration','loops','scale','removeBg','bgColor','tolerance'])$(id).addEventListener('input',refresh);
$('demo').onclick=demo;$('play').onclick=()=>{playing=!playing;if(playing)start=performance.now();else selected=lastDraw;updatePlay();};
for(const b of document.querySelectorAll('[data-bg]'))b.onclick=()=>{$('stage').className='stage '+b.dataset.bg;document.querySelectorAll('[data-bg]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b?'true':'false');});};
$('export').onclick=async()=>{if(busy||loading||!rendered.length)return;busy=true;$('export').disabled=true;const current=revision;status('APNGを作成しています…');try{const images=rendered.map(c=>c.getContext('2d').getImageData(0,0,WIDTH,HEIGHT));const blob=await encodeAPNG(images,Number($('duration').value),Number($('loops').value));if(current!==revision){status('設定が変わりました。もう一度APNGを作成してください。');return;}$('checkSize').textContent=(blob.size/1000).toFixed(1)+' KB';$('sizeCheck').firstElementChild.textContent=blob.size<=MAX_BYTES?'✓':'!';if(blob.size>MAX_BYTES)throw Error('1MBを超えています。フレーム数やイラストの大きさを減らして、再度作成してください。');if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=URL.createObjectURL(blob);$('download').href=downloadURL;$('download').hidden=false;status('作成できました。「01.png を保存」からダウンロードしてください。');}catch(e){if(current===revision)status(e.message,true);}finally{busy=false;$('export').disabled=loading;}};
window.addEventListener('dragover',e=>e.preventDefault());window.addEventListener('drop',e=>{e.preventDefault();if(!$('drop').contains(e.target))load(e.dataTransfer?.files?.[0]);});

demo();requestAnimationFrame(tick);
