import { GifReader } from './vendor/omggif.js';
// Each yielded image is composited before disposal. Consume data before advancing.
export function* decodeGifFrames(bytes){
 if(bytes.length<13||!['GIF87a','GIF89a'].includes(new TextDecoder().decode(bytes.subarray(0,6))))throw Error('GIF形式のファイルを選んでください。');
 const width=bytes[6]|bytes[7]<<8,height=bytes[8]|bytes[9]<<8;
 if(!width||!height||width*height>16000000)throw Error('GIFの解像度が大きすぎます。1600万画素以下にしてください。');
 let reader;try{reader=new GifReader(bytes);}catch{throw Error('GIFを読み込めませんでした。ファイルが壊れていないか確認してください。');}
 const count=reader.numFrames();if(count<2)throw Error('2フレーム以上の動きのあるGIFを選んでください。');if(count>200)throw Error('200フレーム以下のGIFを選んでください。');
 let screen=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<count;i++){
  const info=reader.frameInfo(i);
  if(!info.width||!info.height||info.x+info.width>width||info.y+info.height>height)throw Error('GIFのフレーム領域が不正です。別のGIFでお試しください。');
  const previous=info.disposal===3?screen.slice():null;
  try{reader.decodeAndBlitFrameRGBA(i,screen);}catch{throw Error('GIFのフレームを展開できませんでした。別のGIFでお試しください。');}
  yield {width,height,data:screen,duration:Math.max(20,(info.delay||10)*10),index:i,count};
  if(info.disposal===2){for(let y=info.y;y<info.y+info.height;y++)screen.fill(0,(y*width+info.x)*4,(y*width+info.x+info.width)*4);}
  else if(previous)screen=previous;
 }
}
