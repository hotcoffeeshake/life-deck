const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = {window:{}};
vm.createContext(context);
for (const file of ['sources','catalog']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets',file+'.js'),'utf8'),context);
const original = JSON.stringify(context.window.LifeCatalog.all);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/routes.js'),'utf8'),context);
const {LifeRoutes:R,LifeCatalog:C}=context.window;
const profiles=['student','earlywork','working','changing','family','retired','jobseeker'];
test('608 条原文各有且仅有一个主要方面和子主题，八方面都可独立探索',()=>{
  assert.equal(C.all.length,608);
  assert.equal(R.aspects.length,8);
  const encountered=[];
  for(const a of R.aspects){
    assert(R.cards(a.id).length>0);
    for(const s of a.subtopics){
      const cards=R.cards(a.id,s.id);
      assert(cards.length>0,s.id);
      for(const card of cards){
        encountered.push(card.id);
        const row=R.get(card);
        assert.equal(row.aspect,a.id);
        assert.equal(row.subtopic,s.id);
        assert(row.classificationBasis.startsWith('产品编辑：'));
      }
    }
  }
  assert.equal(encountered.length,608);
  assert.equal(new Set(encountered).size,608);
  assert.equal(R.get('missing'),null);
  assert.equal(R.cards('missing').length,0);
  assert.equal(R.cards('money','first_aid').length,0);
  assert.equal(JSON.stringify(C.all),original,'不得修改原目录条目或原文');
});
test('成本与收益五项标签逐字取自每条原文，不生成综合数值',()=>{
  for(const card of C.all){
    const comment=card.text.match(/<!--\s*成本标签:\s*(.*?)\s*-->/);
    assert(comment,card.id);
    const fields=Object.fromEntries(comment[1].split(/\s+/).map(x=>x.split('=')));
    const row=R.get(card);
    assert.equal(row.cost.money,fields['钱']);
    assert.equal(row.cost.time,fields['时间']);
    assert.equal(row.cost.effort,fields['毅力']);
    assert.equal(row.benefit.level,fields['收益']);
    assert.equal(row.benefit.metric,fields['口径']);
    assert.equal(Object.keys(row.cost).length,3);
    assert.equal(Object.keys(row.benefit).length,2);
  }
});
test('关注人群只影响排序，所有阶段都能访问所有方面和全部原文',()=>{
  for(const profile of profiles){
    const reachable=new Set();
    for(const aspect of R.aspects){
      const candidates=R.cards(aspect.id).sort((a,b)=>R.audienceScore(b,profile)-R.audienceScore(a,profile));
      assert(candidates.length>0);
      candidates.forEach(card=>reachable.add(card.id));
    }
    assert.equal(reachable.size,608,profile);
  }
  for(const card of C.all){
    const row=R.get(card);
    assert(row.audiences.length>0);
    assert(row.audiences.every(x=>profiles.includes(x)));
    assert(Array.isArray(row.conditions));
    if(row.common){assert.equal(row.audiences.length,7);assert.equal(row.conditions.length,0);}
  }
  assert.equal(R.get('source-14-2').common,true);
  assert.equal(R.get('source-33-1').audiences.length,profiles.length,'不把疾病或残疾推断成退休人群');
  assert.equal(R.get('source-33-1').common,false);
  assert(R.get('source-33-1').conditions.length>0);
  assert(R.audienceScore('source-20-1','family')>R.audienceScore('source-20-1','student'));
  assert.equal(R.audienceScore('source-20-1','any'),0);
});
test('选一张之后可继续探索该方面的全部子主题，而非困在单一建议',()=>{
  for(const card of C.all){
    const row=R.get(card),routes=R.followups(card);
    const aspect=R.aspects.find(x=>x.id===row.aspect);
    assert.equal(routes.length,aspect.subtopics.length);
    assert.equal(routes[0].subtopic,row.subtopic);
    const reachable=routes.flatMap(x=>Array.from(x.ids));
    assert.equal(reachable.length,R.cards(row.aspect).length-1);
    assert(!reachable.includes(card.id));
    assert.equal(new Set(reachable).size,reachable.length);
    for(const next of routes){
      assert.equal(next.aspect,row.aspect);
      assert(next.ids.every(id=>R.get(id).subtopic===next.subtopic));
    }
  }
  assert.equal(R.followups('missing').length,0);
});
test('代表条目按真实场景跨章归类，人生道路和留学保持完整语境',()=>{
  const checks={
    'source-1-1':['safety','accidents'],
    'source-1-7':['health','chronic'],
    'source-3-1':['daily','focus'],
    'source-3-16':['relations','social'],
    'source-4-18':['home','housing'],
    'source-5-1':['money','fixed_spending'],
    'source-5-12':['health','care'],
    'source-5-30':['safety','law_fraud'],
    'source-7-14':['work','job_search'],
    'source-13-1':['safety','first_aid'],
    'source-18-1':['home','parenting'],
    'source-23-14':['work','study_methods'],
    'source-28-1':['health','appearance'],
    'source-31-15':['choices','adulthood'],
    'source-32-7':['choices','abroad'],
    'source-33-10':['health','disability']
  };
  for(const [id,[aspect,subtopic]] of Object.entries(checks)){assert.equal(R.get(id).aspect,aspect,id);assert.equal(R.get(id).subtopic,subtopic,id);}
  for(const card of C.all.filter(c=>c.chapterId===31||c.chapterId===32))assert.equal(R.get(card).aspect,'choices');
});
