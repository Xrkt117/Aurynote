import { test, expect, chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
test('a synthetic microphone tone is recognized and the input stops',async()=>{
  mkdirSync('artifacts',{recursive:true});const rate=48000,count=rate*3;
  const wav=Buffer.alloc(44+count*2);wav.write('RIFF',0);wav.writeUInt32LE(36+count*2,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*2,40);
  for(let i=0;i<count;i++)wav.writeInt16LE(Math.round(9000*Math.sin(2*Math.PI*261.625565*i/rate)),44+i*2);
  const file=resolve('artifacts/microphone-tone.wav');writeFileSync(file,wav);
  const browser=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream',`--use-file-for-fake-audio-capture=${file}`]});
  try{const context=await browser.newContext({permissions:['microphone']});const page=await context.newPage();await page.goto('http://127.0.0.1:5173');await page.getByRole('button',{name:'Play it back',exact:true}).click();await page.getByRole('button',{name:'Start microphone'}).click();await expect(page.getByText("That's it. You found the note.")).toBeVisible({timeout:15000});await expect(page.getByText('Microphone off',{exact:true})).toBeVisible();await page.screenshot({path:'artifacts/pitch-matched.png',fullPage:true,animations:'disabled'});}finally{await browser.close();}
});
