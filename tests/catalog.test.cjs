const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function load() {
  const context = {window:{}};
  vm.createContext(context);
  for (const file of ['sources','catalog']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets',file+'.js'),'utf8'), context);
  return context.window;
}
const env = load();
test('原文33章608个条目全部进入目录，每段逐字保留且ID唯一', () => {
  const {LifeSources,LifeCatalog} = env;
  assert.equal(LifeSources.chapters.length,33);
  assert.equal(LifeCatalog.all.length,608);
  const seen = new Set();
  let count=0;
  for(const chapter of LifeSources.chapters) {
    const headings = Array.from(chapter.text.matchAll(/^###[ \t]+([^\r\n]+)\r?$/gm));
    for(let i=0;i<headings.length;i++) {
      const id='source-'+chapter.id+'-'+(i+1);
      const card = LifeCatalog.get(id);
      assert(card, id);
      assert(!seen.has(id));seen.add(id);count++;
      assert.equal(card.text,chapter.text.slice(headings[i].index, i+1<headings.length ? headings[i+1].index : chapter.text.length));
      assert.equal(card.heading,headings[i][1]);
      assert.equal(card.title,headings[i][1].replace(/^\d+[.、．][ \t]*/,''));
      assert.equal(card.chapterId,chapter.id);
      assert.equal(card.url,chapter.url);
      assert.equal(card.sourceOriginal,true);
      assert.equal(card.steps.length,0,'原文条目不应拆成多个行动步骤');
    }
  }
  assert.equal(count,608);
  assert.equal(seen.size,LifeCatalog.all.length);
  assert.equal(LifeCatalog.get('unknown'),null);
});
test('省钱章38条各有题面，订阅只占一条，涵盖多个消费场景', () => {
  const cards=env.LifeCatalog.all.filter(card=>card.chapterId===5);
  assert.equal(cards.length,38);
  assert.equal(cards.filter(card=>card.calc==='subscription').length,1);
  assert.equal(cards.find(card=>card.calc==='subscription').id,'source-5-1');
  assert.equal(cards.find(card=>card.calc==='plan').id,'source-5-4');
  const groups=new Set(cards.map(card=>card.group));
  for(const group of ['bills','finance','housing','shopping','family','health','food','travel','safety']) assert(groups.has(group),group);
  for(const card of cards) {
    assert(card.question.endsWith('？'));
    assert(card.question.length>=15 && card.question.length<=35, card.id+' '+card.question.length);
    assert(card.tags.includes('money'));
  }
  assert.equal(env.LifeCatalog.all.filter(card=>card.calc).length,2);
});
test('收益字段完整保留原文，不引入或缩写原文数值', () => {
  for(const card of env.LifeCatalog.all) {
    const lines=card.text.split('\n');
    const start=lines.findIndex(line=>/^- 收益[：:]/.test(line));
    if(start<0) {assert.equal(card.benefit,'');continue;}
    let end=start+1;
    while(end<lines.length && !/^-[ \t]+[^\n：:]+[：:]/.test(lines[end])) end++;
    const expected=[lines[start].replace(/^- 收益[：:]\s*/,''),...lines.slice(start+1,end)].join('\n').replace(/\s+$/,'');
    assert.equal(card.benefit,expected,card.id);
  }
});
test('编辑标签只作排序属性，不因阶段或主题标签隐藏条目', () => {
  const validGroups=new Set(['bills','shopping','housing','food','travel','family','work','finance','health','safety','time','learning','relationships','choices']);
  for(const card of env.LifeCatalog.all) {
    assert(validGroups.has(card.group),card.id+' '+card.group);
    assert(Array.isArray(card.tags));
    assert(card.tags.every(tag=>typeof tag==='string'));
    assert(card.tags.includes(card.group));
    assert.equal(env.LifeCatalog.get(card.id),card);
  }
  assert.equal(env.LifeCatalog.all.length,608);
});
