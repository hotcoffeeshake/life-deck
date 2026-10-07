'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
function load(){const context={window:{}};vm.createContext(context);for(const name of ['content','sources','reading'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets',name+'.js'),'utf8'),context);return context.window;}
function cards(root){return Object.values(root.LifeContent.domains).flatMap(d=>d.scenes.flatMap(s=>s.cards));}
test('every action has an explicit, natural question and transparent editorial attribution',()=>{
 const root=load();const all=cards(root);assert.equal(all.length,81);
 for(const card of all){const q=root.LifeReading.question(card);assert.ok(q.endsWith('？'),card.id);assert.notEqual(q,'这条建议适合我现在的情况吗？',card.id);assert.ok(q.length>=15&&q.length<=30,card.id+' question length '+q.length);assert.notEqual(q,card.title+'？',card.id);assert.match(root.LifeReading.note(card),/整理/);}
 assert.equal(new Set(all.map(c=>root.LifeReading.question(c))).size,81);
});
test('every referenced reading is the unmodified complete level-three source section, with all metadata',()=>{
 const root=load();let count=0;
 for(const card of cards(root)){
  const readings=root.LifeReading.sections(card);
  if(readings.length===0){assert.match(root.LifeReading.note(card),/尚未找到直接对应/);continue;}
  for(const section of readings){
   const chapter=root.LifeSources.chapters.find(c=>c.id===section.chapterId);assert.ok(chapter,card.id);
   assert.equal(section.chapterTitle,chapter.title);assert.equal(section.url,chapter.url);assert.ok(section.heading);
   const headings=Array.from(chapter.text.matchAll(/^### ([^\r\n]+)\r?$/gm));
   const index=headings.findIndex(h=>h[1]===section.heading);assert.ok(index>=0,card.id);
   assert.equal(section.text,chapter.text.slice(headings[index].index,index+1<headings.length?headings[index+1].index:chapter.text.length),card.id);
   assert.match(section.text,/^- 来源[：:]/m,card.id);assert.ok(section.text.length>200,card.id);count++;
  }
 }
 assert.ok(count>80);
});
test('reading results cannot mutate cached source and product-only actions have no invented citations',()=>{
 const root=load();const card={id:'subscription-stop'};const one=root.LifeReading.sections(card);const original=one[0].text;one[0].text='changed';assert.equal(root.LifeReading.sections(card)[0].text,original);
 for(const id of ['commute-batch','care-questions','firstpath-try','city-visit','child-plan','child-record'])assert.equal(root.LifeReading.sections({id}).length,0,id);
 assert.equal(root.LifeReading.sections({id:'unknown'}).length,0);
});

test('every full-text source chapter is reachable and named even when outside scene references',()=>{const root=load();for(const domain of Object.values(root.LifeContent.domains))for(const scene of domain.scenes)for(const original of scene.cards){const card=Object.assign({},original,{chapters:scene.chapters});const ids=root.LifeReading.chapterIds(card),label=root.LifeReading.sourceLabel(card);for(const source of root.LifeReading.sections(card)){assert(ids.includes(source.chapterId),card.id);assert(label.includes(String(source.chapterId)),card.id);}}const card={id:'moving-contact',chapters:[1,14,15]};assert(root.LifeReading.chapterIds(card).includes(29));assert.match(root.LifeReading.sourceLabel(card),/本页原文来自第 29 章/);});
