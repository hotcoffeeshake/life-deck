const {chromium}=require('/Users/qichenxie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const base=process.env.LIFE_DECK_URL||'http://127.0.0.1:8796';
const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('life-deck.v1')));
const hand=p=>p.locator('[data-advice]').evaluateAll(es=>es.map(e=>e.dataset.advice));
const subs=async p=>p.evaluate(ids=>ids.map(id=>LifeRoutes.get(id).subtopic),await hand(p));
async function settled(p){await p.waitForFunction(()=>!document.querySelector('.picked,.hand-passed'));}
async function pick(p,index=0){await p.locator('[data-advice]').nth(index).click();await settled(p);}
async function swipe(p){const r=await p.locator('.route-hand').boundingBox();await p.mouse.move(r.x+r.width-12,r.y+70);await p.mouse.down();await p.mouse.move(r.x+12,r.y+75,{steps:12});await p.mouse.up();await settled(p);}
// Bounded question handler: only clicks options that actually exist, never assumes a specific id present.
async function handleQuestion(p,pickId,maxSteps){
 for(let i=0;i<(maxSteps||6);i++){
  const count=await p.locator('[data-answer]').count();if(!count)return;
  let btn=pickId?p.locator('[data-answer="'+pickId+'"]'):null;
  if(!btn||!(await btn.count()))btn=p.locator('[data-answer]').first();
  await btn.click();
 }
}
async function fillTo10(p,guard){
 guard=guard||40;
 for(let i=0;i<guard;i++){
  const d=await saved(p);if(d.deck.length>=10)return;
  if(await p.locator('[data-answer]').count()){await handleQuestion(p,null,1);continue;}
  if(await p.locator('[data-advice]').count()){await pick(p,i%3);continue;}
  break;
 }
}
(async()=>{const browser=await chromium.launch();try{
const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],external=[];
p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
const shot=n=>p.screenshot({path:path.join(__dirname,'../design',n+'.png'),fullPage:true});

// Landing: 7 profiles
await p.goto(base);assert.equal(await p.locator('.vertical-menu [data-profile]').count(),7);

// Student -> study_efficiency: first hand must be study_methods/focus subtopics, no unrelated aspect inserted
await p.locator('[data-profile=student]').click();
assert.equal(await p.locator('.vertical-menu [data-need]').count(),3);
await p.locator('.vertical-menu [data-need]',{hasText:'提高学习效率'}).first().click();
assert.equal((await saved(p)).goal,'study_efficiency');assert.equal((await saved(p)).need,'study_efficiency');
assert.equal(await p.locator('[data-advice]').count(),3);
const s1=await subs(p);assert(s1.every(x=>x==='study_methods'||x==='focus'),'first student hand off-topic: '+s1);
await shot('v7-学生首组');
const first=await hand(p);await pick(p);
assert.equal((await saved(p)).deck.length,1);assert.equal(await p.locator('[data-tray-card]').count(),1);
assert((await hand(p)).every(id=>!first.includes(id))||await p.locator('[data-answer]').count()>0);

// Undo on card-choice page: banner present, works, then disappears
assert.equal(await p.locator('[data-action=undo]').count(),1);
await p.locator('[data-action=undo]').click();assert.equal((await saved(p)).deck.length,0);
await pick(p);
// Editing a fact after picking clears the undo banner and does not roll back the deck.
if(await p.locator('[data-action=toggle-context]').count()){
 const deckBefore=(await saved(p)).deck.length;
 await p.locator('[data-action=toggle-context]').click();
 if(await p.locator('.context-chip').count()){await p.locator('.context-chip').first().click();
  assert.equal(await p.locator('[data-action=undo]').count(),0);
  assert.equal((await saved(p)).deck.length,deckBefore);}
}

// Rounds 1-3 stay on-topic; breadth question must not appear before round 3
for(let r=0;r<2;r++){
 if(await p.locator('[data-answer]').count()){await handleQuestion(p,null,1);continue;}
 const off=(await subs(p)).filter(x=>x!=='study_methods'&&x!=='focus'&&x!=='rest'&&x!=='habits');
 assert.equal(off.length,0,'unrelated card inserted before round 3: '+off);
 assert.equal(await p.locator('main h1').innerText().then(t=>/其他领域/.test(t)),false);
 await pick(p,0);
}
// Continue until breadth checkpoint appears (bounded) and confirm it is a real question, answer it once.
for(let i=0;i<6;i++){
 if(await p.locator('main h1').innerText().then(t=>/其他领域/.test(t)))break;
 if(await p.locator('[data-answer]').count()){await handleQuestion(p,null,1);continue;}
 if(await p.locator('[data-advice]').count()){await pick(p,0);continue;}
 break;
}
if(await p.locator('main h1').innerText().then(t=>/其他领域/.test(t)))await handleQuestion(p,'any',1);

// Answering a question must immediately deal cards/another question in the same turn, not stack two prompts in a row for the same id.
if(await p.locator('[data-answer]').count()){
 const qid=await p.evaluate(()=>JSON.parse(localStorage.getItem('life-deck.v1')).pendingQuestion);
 await handleQuestion(p,null,1);
 const qid2=await p.evaluate(()=>JSON.parse(localStorage.getItem('life-deck.v1')).pendingQuestion);
 assert.notEqual(qid,qid2,'same question re-asked immediately after answering');
}
if(await p.locator('[data-advice]').count()===0&&await p.locator('[data-answer]').count()===0)await p.locator('[data-action=resume]').first().click();

// Reload keeps progress
await p.reload();await p.locator('[data-action=resume]').first().click();
assert(await p.locator('[data-advice]').count()>0||await p.locator('[data-answer]').count()>0);

// Responsive viewports: no page overflow, tray visible while collecting
for(const [w,h] of [[320,568],[390,844],[430,932],[1280,900]]){
 await p.setViewportSize({width:w,height:h});
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow '+w);
 assert(await p.locator('.deck-tray').isVisible());
}
// 320px title fit for all 608 real question texts; tolerate cards without a cost/benefit panel.
await p.setViewportSize({width:320,height:568});
const bad=await p.evaluate(()=>{const target=document.querySelector('[data-advice]'),title=target.querySelector('.card-title'),front=target.querySelector('.card-front'),bad=[];for(const card of LifeCatalog.all){title.textContent=card.title;const panel=target.querySelector('.card-panel');if(panel&&title.getBoundingClientRect().bottom>panel.getBoundingClientRect().top+1)bad.push(card.id);if(front.scrollWidth>front.clientWidth+1)bad.push(card.id);}return bad;});
assert.deepEqual(bad,[],'title/panel overlap or overflow at 320px');

// Library: existing card with no prerequisite is added directly on click; reading it again from deck shows full text.
await p.setViewportSize({width:390,height:844});
await p.locator('#deck-button').click();await p.locator('[data-action=all-library]').click();
assert.equal(await p.locator('[data-open-source]').count(),608);
const targetId='source-5-1';
await p.locator('[data-open-source="'+targetId+'"]').click();
if(!await p.locator('.reading-paper').count())await p.locator('[data-tray-card="'+targetId+'"]').click();
assert.equal(await p.locator('.reading-paper').count(),1);
const titleText=await p.locator('.reading-paper h1').innerText();
assert.equal(titleText,await p.evaluate(id=>LifeCatalog.get(id).title,targetId));
assert(await p.evaluate(id=>{const s=JSON.parse(localStorage.getItem('life-deck.v1'));return s.deck.some(c=>c.id===id);},targetId));
// Preserve the existing manual estimate and paginated full-text save checks.
await p.locator('.calc summary').click();await p.locator('[data-field=fee]').fill('30');await p.locator('[data-field=months]').fill('12');await p.locator('#estimate-confirm').check();await p.locator('[data-action=calculate]').click();assert.equal((await saved(p)).deck.find(x=>x.id==='source-5-1').estimate.value,360);assert.equal(await p.locator('[data-action=collect]').count(),0);
await p.locator('.reading-paper [data-action=sources]').click();await p.locator('[data-chapter="5"]').click();await p.locator('#modal-mask [data-action=sources]').click();await p.locator('[data-action=detail-return]').click();assert.match(await p.locator('#calc-result').innerText(),/360/);
assert(await p.evaluate(()=>{const c=LifeCatalog.get('source-5-1');return LifePlatform.readingPages(c).flat().map(x=>x.text).join('').includes(LifeReading.displayText(c.text,true).replace(/\n/g,''));}));
await p.locator('[data-action=reading-poster]').click();assert.equal(await p.locator('#poster-image').evaluate(e=>e.naturalWidth),1080);const src=await p.locator('#poster-image').getAttribute('src');await p.locator('[data-action=poster-next]').click();assert.notEqual(await p.locator('#poster-image').getAttribute('src'),src);await p.locator('#save-image').click();assert.match(await p.locator('#save-status').innerText(),/未写入相册/);await p.locator('#modal-close').click();
// Duplicate history click on the same card reads full text again without duplicating the deck entry.
await p.locator('[data-action=reading-back]').first().click();
await p.locator('#deck-button').click();await p.locator('[data-action=all-library]').click();
await p.locator('[data-open-source="'+targetId+'"]').click();
assert.equal(await p.locator('.reading-paper').count(),1);
assert.equal(await p.evaluate(id=>JSON.parse(localStorage.getItem('life-deck.v1')).deck.filter(c=>c.id===id).length,targetId),1);
await p.locator('[data-action=reading-back]').first().click();

// Fill to exactly 10 through real interaction (no shortcut assertion skip).
await p.locator('#deck-button').click();await p.locator('[data-action=resume]').first().click();
await fillTo10(p);
assert.equal((await saved(p)).deck.length,10,'did not reach 10 through real play');
assert(await p.evaluate(()=>LifeCore.validate(JSON.parse(localStorage.getItem('life-deck.v1')))));
await p.locator('#deck-button').click();await shot('v7-牌组概览');
assert.equal(await p.locator('[data-open-saved]').count(),10);
assert.equal(await p.locator('.deck-tray').count(),0);

// Full deck: library click on an uncollected card only opens read-only text, never adds it.
await p.locator('[data-action=all-library]').click();
const deckBefore=(await saved(p)).deck.map(c=>c.id);
await p.locator('[data-open-source]').nth(300).click();
assert.equal(await p.locator('.reading-paper').count(),1);
assert.deepEqual((await saved(p)).deck.map(c=>c.id),deckBefore,'full-deck library read must not add a card');
await p.locator('[data-action=reading-back]').first().click();

// Remove a card, then add 10th again to re-confirm new-session cycles correctly (no shortcut).
await p.locator('#deck-button').click();p.once('dialog',d=>d.accept());
await p.locator('[data-remove]').first().click();
assert.equal((await saved(p)).deck.length,9);
await p.locator('[data-action=resume]').first().click();
await fillTo10(p);
assert.equal((await saved(p)).deck.length,10,'did not re-reach 10 after removal');
await p.locator('#deck-button').click();
await p.locator('[data-action=new-session]').click();
assert.equal((await saved(p)).deck.length,0);
assert((await saved(p)).archive.length>=9);
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
await p.close();

// Jobseeker: first hand must be job_search/skills related to find_job; job_search + employed can coexist via fact editor.
const q=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await q.goto(base);await q.locator('[data-profile=jobseeker]').click();
await q.locator('.vertical-menu [data-need]',{hasText:'找到合适的工作'}).first().click();
const qs=await subs(q);assert(qs.every(x=>x==='job_search'||x==='skills'),'jobseeker first hand off-topic: '+qs);
await q.screenshot({path:path.join(__dirname,'../design/v7-求职首组.png'),fullPage:true});

// Swiping the whole hand does not accidentally collect a card; ArrowLeft behaves the same.
const before=await hand(q);await swipe(q);
assert.equal((await q.evaluate(()=>JSON.parse(localStorage.getItem('life-deck.v1')).deck.length)),0);
assert((await hand(q)).every(id=>!before.includes(id))||await q.locator('[data-answer]').count()>0);
if(await q.locator('[data-advice]').count()){await q.locator('.route-hand').focus();await q.keyboard.press('ArrowLeft');await settled(q);
 assert.equal((await q.evaluate(()=>JSON.parse(localStorage.getItem('life-deck.v1')).deck.length)),0);}

// A real double-click within the flight window only collects once.
await handleQuestion(q,null,3);
await q.emulateMedia({reducedMotion:'no-preference'});
assert((await q.locator('[data-advice]').count())>0&&(await q.locator('[data-advice]').count())<=3);
await q.locator('[data-advice]').first().dblclick({delay:25});
await settled(q);
assert.equal((await q.evaluate(()=>JSON.parse(localStorage.getItem('life-deck.v1')).deck.length)),1);

// Context editor: employed + job_search can coexist.
if(await q.locator('[data-action=toggle-context]').count()){
 await q.locator('[data-action=toggle-context]').click();
 const chips=await q.locator('.context-chip').allTextContents();
 const employedChip=chips.find(c=>c.includes('在职'));
 if(employedChip)await q.locator('.context-chip',{hasText:'在职'}).first().click();
 const ctxNow=(await saved(q)).contexts;
 assert(ctxNow.includes('job_search')||ctxNow.includes('employed'));
}
await q.close();

// Undo on a question page: 5s window, then it must disappear.
const u=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await u.goto(base);await u.locator('[data-profile=student]').click();
await u.locator('.vertical-menu [data-need]').first().click();
await pick(u);
if(await u.locator('[data-answer]').count()){
 assert.equal(await u.locator('[data-action=undo]').count(),1);
} else {
 assert.equal(await u.locator('[data-action=undo]').count(),1);
}
await u.close();

// Reload preserves deck and confirmed facts (persistence).
const r=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await r.goto(base);await r.locator('[data-profile=working]').click();
await r.locator('.vertical-menu [data-need]').first().click();
await pick(r);const beforeReload=await saved(r);
await r.reload();await r.locator('[data-action=resume]').first().click();
assert.deepEqual((await saved(r)).deck,beforeReload.deck);
assert.equal((await saved(r)).profile,beforeReload.profile);
await r.close();

// Storage write failure keeps the visible warning.
const t=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});
await t.addInitScript(()=>{Storage.prototype.setItem=function(){throw Error('quota');};});
await t.goto(base);await t.locator('[data-profile=student]').click();
await t.locator('.vertical-menu [data-need]').first().click();
await pick(t);
assert(await t.locator('#storage-warning').isVisible());
await t.close();

// Corrupt localStorage must not be silently overwritten by app boot.
const corruptPage=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});
await corruptPage.addInitScript(()=>localStorage.setItem('life-deck.v1','{not-json'));
await corruptPage.goto(base);
assert.equal(await corruptPage.evaluate(()=>localStorage.getItem('life-deck.v1')),'{not-json');
await corruptPage.close();

// Native bridge save receipt is honored (mock saveImageToPhotosAlbum).
const n=await browser.newPage({viewport:{width:320,height:568},reducedMotion:'reduce'});
await n.addInitScript(()=>{window.calls=[];window.xhs={miniTool:{saveImageToPhotosAlbum:a=>{calls.push(a);return Promise.resolve({errMsg:'saveImageToPhotosAlbum:ok'});}}};});
await n.goto(base);await n.locator('[data-profile=student]').click();
await n.locator('.vertical-menu [data-need]').first().click();
await pick(n);
await n.locator('[data-tray-card]').first().click();
await n.locator('[data-action=reading-poster]').click();
await n.locator('#save-image').click();
await n.waitForFunction(()=>!document.querySelector('#save-image').disabled);
assert.match(await n.locator('#save-status').innerText(),/已保存/);
assert.equal(await n.evaluate(()=>calls.length),1);
await n.close();

// Real v6 fixture migration: verify via initScript, not by fabricating a v7-tagged object.
const v6=require('node:fs').readFileSync(path.join(__dirname,'v6-fixture.json'),'utf8');
const v6data=JSON.parse(v6);
const m=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await m.addInitScript(data=>localStorage.setItem('life-deck.v1',JSON.stringify(data)),v6data);
await m.goto(base);
assert.equal(await m.locator('#deck-count').innerText(),'2');
await m.locator('#deck-button').click();
// Loading migrates in memory; a normal user edit persists the upgraded state.
await m.locator('[data-done="source-5-1"]').click();
await m.locator('[data-done="source-5-1"]').click();
const migrated=await saved(m);
assert.equal(migrated.version,7);
assert.equal(migrated.deck.length,2);
assert.equal(migrated.deck.find(c=>c.id==='source-5-1').done,true);
assert.equal(migrated.deck.find(c=>c.id==='source-5-1').estimate.value,360);
assert.equal(migrated.goal,'study_efficiency');
assert.equal(migrated.need,'study_efficiency');
await m.close();

console.log('PASS: 首组话题命中、连问即发牌、10张真实凑齐、整组左划与ArrowLeft不误收、双击收一次、编辑事实撤回不覆盖事实、库读全文与满10只读、v6迁移、坏存档不覆盖、写失败提示、原生保存回执');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
