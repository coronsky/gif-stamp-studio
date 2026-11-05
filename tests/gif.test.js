import test from 'node:test';
import assert from 'node:assert/strict';
import {GifWriter} from '../dist/vendor/omggif.js';
import {decodeGifFrames} from '../dist/gif.js';
function fixture(specs){const buffer=new Uint8Array(8192),writer=new GifWriter(buffer,3,1,{palette:[0,0xff0000,0x00ff00,0x0000ff]});for(const s of specs)writer.addFrame(s.x||0,0,s.pixels.length,1,s.pixels,{delay:s.delay||10,disposal:s.disposal||1,transparent:0,...(s.palette?{palette:s.palette}:{})});return buffer.slice(0,writer.end());}
function decode(bytes){return Array.from(decodeGifFrames(bytes),f=>({...f,data:f.data.slice()}));}
const red=[255,0,0,255],green=[0,255,0,255],blue=[0,0,255,255],clear=[0,0,0,0];
test('GIF decoding works without native ImageDecoder',()=>{assert.equal(typeof globalThis.ImageDecoder,'undefined');const result=decode(fixture([{pixels:[1,0,2],delay:12},{pixels:[3,1,0],delay:25}]));assert.equal(result.length,2);assert.deepEqual([...result[0].data],[...red,...clear,...green]);assert.deepEqual([...result[1].data],[...blue,...red,...green]);assert.deepEqual(result.map(f=>f.duration),[120,250]);});
test('disposal 2 clears only the frame rectangle; disposal 3 restores previous image',()=>{const result=decode(fixture([{pixels:[1,1,1]},{x:0,pixels:[2],disposal:2},{x:2,pixels:[3],disposal:3},{x:1,pixels:[2]}]));assert.deepEqual([...result[1].data],[...green,...red,...red]);assert.deepEqual([...result[2].data],[...clear,...red,...blue]);assert.deepEqual([...result[3].data],[...clear,...green,...red]);});
test('local frame palette is respected',()=>{const result=decode(fixture([{pixels:[1,1,1]},{pixels:[1,0,1],palette:[0,0x0000ff]}]));assert.deepEqual([...result[1].data],[...blue,...red,...blue]);});
test('reject static GIF and invalid file with useful messages',()=>{assert.throws(()=>decode(fixture([{pixels:[1,1,1]}])),/2フレーム/);assert.throws(()=>decode(new Uint8Array(20)),/GIF形式/);});
test('reject excessive frame count and invalid frame bounds',()=>{assert.throws(()=>decode(fixture(Array.from({length:201},()=>({pixels:[1]})))),/200フレーム/);assert.throws(()=>decode(fixture([{x:3,pixels:[1]},{pixels:[1]}])),/フレーム領域/);});
test('reject huge logical dimensions before allocating pixels',()=>{const bytes=fixture([{pixels:[1]},{pixels:[2]}]);bytes[6]=255;bytes[7]=255;bytes[8]=255;bytes[9]=255;assert.throws(()=>decode(bytes),/解像度/);});
