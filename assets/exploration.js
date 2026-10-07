(function(root){
'use strict';
const Legacy=root.LifeCore,Catalog=root.LifeCatalog;
const profiles=root.LifeInterests.profiles.filter(p=>p.id!=='jobseeker').concat([{id:'jobseeker',title:'正在找工作',sub:'求职、面试、准备下一份工作'}]);

/* ---------- 目标定义：每个阶段 3 个具体目标，按真实子主题加权 ---------- */
const GOALS={
 study_efficiency:{title:'提高学习效率',sub:'学习方法、专注、休息',subs:{study_methods:10,focus:8,rest:5,habits:4}},
 graduation:{title:'决定毕业后做什么',sub:'升学、找工作、下一步',subs:{adulthood:10,decisions:9,skills:6}},
 student_budget:{title:'省下生活费',sub:'固定支出、日常消费、住处',subs:{fixed_spending:10,consumption:8,housing:5}},
 find_job:{title:'找到合适的工作',sub:'求职、面试、相关技能',subs:{job_search:12,skills:6}},
 job_time:{title:'安排好求职时间',sub:'专注、习惯、休息',subs:{focus:9,habits:7,rest:6}},
 daily_budget:{title:'减少日常开支',sub:'固定支出、日常消费',subs:{fixed_spending:10,consumption:8}},
 save_time:{title:'省时间和精力',sub:'专注、习惯、休息',subs:{focus:9,habits:8,rest:6}},
 career_next:{title:'决定下一步怎么走',sub:'选择、技能、机会',subs:{decisions:10,skills:7,job_search:5}},
 save_money:{title:'省钱',sub:'固定支出、日常消费、储蓄',subs:{fixed_spending:10,consumption:8,savings_investing:5}},
 first_job:{title:'适应第一份工作',sub:'职场权益、技能、习惯',subs:{labor_rights:9,skills:8,habits:5}},
 transition_budget:{title:'减少过渡期开支',sub:'固定支出、消费、可用支持',subs:{fixed_spending:10,consumption:7,benefits_support:6}},
 transition_routine:{title:'安排好过渡期的生活',sub:'习惯、休息、专注',subs:{habits:8,rest:7,focus:6}},
 care_family:{title:'减轻照顾家人的负担',sub:'照护、长辈、孩子',subs:{care:10,eldercare:8,parenting:8}},
 family_plan:{title:'做好家庭安排',sub:'孩子、长辈、住处安排',subs:{parenting:9,eldercare:8,housing:6,decisions:5}},
 family_budget:{title:'减少家庭开支',sub:'固定支出、消费、住处',subs:{fixed_spending:10,consumption:7,housing:5}},
 stay_well:{title:'照顾好身体',sub:'预防、生活方式、长期管理',subs:{prevention:10,lifestyle:8,chronic:6,rest:5}},
 retirement_life:{title:'安排退休生活',sub:'生活方式、社交、习惯',subs:{lifestyle:8,social:7,habits:6}},
 make_decision:{title:'做一个重要决定',sub:'选择、成年事务、技能',subs:{decisions:10,adulthood:6,skills:5}}
};
const PROFILE_GOALS={
 student:['study_efficiency','graduation','student_budget'],
 jobseeker:['find_job','job_time','daily_budget'],
 working:['save_time','career_next','save_money'],
 earlywork:['first_job','save_money','save_time'],
 changing:['find_job','transition_budget','transition_routine'],
 family:['care_family','family_plan','family_budget'],
 retired:['stay_well','retirement_life','daily_budget'],
 any:['save_money','save_time','make_decision']
};
const NEED_MAP={
 student:{money:'student_budget',energy:'study_efficiency',direction:'graduation'},
 jobseeker:{money:'daily_budget',energy:'job_time',direction:'find_job'},
 working:{money:'save_money',energy:'save_time',direction:'career_next'},
 earlywork:{money:'save_money',energy:'save_time',direction:'first_job'},
 changing:{money:'transition_budget',energy:'transition_routine',direction:'find_job'},
 family:{money:'family_budget',energy:'care_family',direction:'family_plan'},
 retired:{money:'daily_budget',energy:'stay_well',direction:'retirement_life'},
 any:{money:'save_money',energy:'save_time',direction:'make_decision'}
};

/* ---------- 问题 ---------- */
const QUESTIONS={
 work_context:{id:'work_context',title:'再看清一点：你现在的工作情况是？',options:[{id:'job_search',title:'正在找工作'},{id:'employed',title:'目前在职'},{id:'general',title:'先看通用建议'}]},
 applicability:{id:'applicability',title:'这张牌有个入口条件，先确认一下',options:[{id:'confirm',title:'符合我的情况，继续'},{id:'no',title:'不符合，看看别的'},{id:'later',title:'暂时不确认'}]},
 breadth:{id:'breadth',title:'想看看其他领域的建议吗？',options:[{id:'broaden',title:'看看其他领域'},{id:'follow',title:'继续这个方向'},{id:'any',title:'都可以'}]},
 empty:{id:'empty',title:'这几组都没想留下的，接下来怎么走？',options:[{id:'general',title:'看看日常能用的'},{id:'focus',title:'再找找刚才的问题'},{id:'change',title:'换个方向'}]},
 grad_direction:{id:'grad_direction',title:'毕业之后，你现在更倾向哪条路？',options:[{id:'study',title:'正在考虑继续升学'},{id:'job',title:'准备找工作'},{id:'any',title:'还没定，先都看看'}]},
 care_target:{id:'care_target',title:'你现在主要在照顾谁？',options:[{id:'eldercare',title:'照顾长辈'},{id:'parenting',title:'照顾孩子'},{id:'general',title:'先看日常能用的'}]},
 age_check:{id:'age_check',title:'有些路标是给 60 岁以上的旅人准备的，适用于你吗？',options:[{id:'yes',title:'适用'},{id:'no',title:'不适用'},{id:'later',title:'暂时不确认'}]},
 context_confirm:{id:'context_confirm',title:'这张牌需要先确认一个情况',options:[{id:'yes',title:'符合我的情况'},{id:'no',title:'不符合'},{id:'later',title:'暂时不确认'}]}
};
const ONE_TIME=['breadth','empty','grad_direction','care_target','age_check','work_context'];
const universal=['source-3-1','source-14-2','source-5-23','source-4-1','source-14-6','source-5-24'];

function applicability(){if(!root.LifeApplicability)throw Error('建议适用条件尚未加载');return root.LifeApplicability;}
function routes(){if(!root.LifeRoutes)throw Error('建议路由尚未加载');return root.LifeRoutes;}
function route(x){return routes().get(typeof x==='string'?x:x.id);}
function eligible(s,c){return applicability().eligible(c,s.contexts||[]);}
function ctxExists(id){return applicability().contexts.some(c=>c.id===id);}
function pickCtx(list){for(const id of list)if(ctxExists(id))return id;return null;}
const CTX={
 study:function(){return pickCtx(['education_transition']);},
 elder:function(){return pickCtx(['eldercare','elder_care','caring_elder','has_elder']);},
 parent:function(){return pickCtx(['parenting','has_children','has_child','child_care']);}
};
function isMedical(id){return /health_source|medical/.test(id);}
function sessionId(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);}

function initial(){return {version:7,profile:null,goal:null,need:null,contexts:[],declined:[],deck:[],archive:[],seen:[],batch:[],decisions:{},trail:[],round:0,emptyRounds:0,checkpoints:[],pendingQuestion:null,pendingCard:null,pendingContext:null,lastAsk:null,answers:{},visited:[],estimates:{},undo:null,sessionId:sessionId()};}

/* ---------- 基础查询 ---------- */
function goalsFor(profile){return (PROFILE_GOALS[profile]||PROFILE_GOALS.any).slice();}
function needs(s){const list=goalsFor(s&&s.profile);return {title:'你现在最想做到什么？',options:list.map(id=>({id:id,title:GOALS[id].title,sub:GOALS[id].sub||''}))};}
function subWeight(goal,sub){const g=GOALS[goal];return (g&&g.subs[sub])||0;}
function topSubs(goal,n){const g=GOALS[goal];if(!g)return [];return Object.keys(g.subs).sort((a,b)=>g.subs[b]-g.subs[a]).slice(0,n);}
function relevant(s,c){return subWeight(s.goal,route(c).subtopic)>0;}
function pool(s){const saved=new Set(s.archive.map(c=>c.id));return Catalog.all.filter(c=>!saved.has(c.id));}
function coverage(s){const shown=new Set(s.seen.map(id=>route(id).aspect));return routes().aspects.map(a=>({id:a.id,title:a.title,shown:shown.has(a.id)}));}
function lastPicked(s){const ids=s.trail||[];for(let i=ids.length-1;i>=0;i--)if(s.deck.some(c=>c.id===ids[i]))return Catalog.get(ids[i]);return null;}
function isComplete(s){return s.deck.length>=10;}
function recommend(s){return s.batch.map(id=>Catalog.get(id)).filter(c=>c&&eligible(s,c));}

function buildContext(s){
 const last=lastPicked(s),follow=new Set();
 if(last){try{routes().followups(last).forEach(f=>(f.ids||[]).forEach(id=>follow.add(id)));}catch(e){}}
 const prefSub=new Set(),prefAsp=new Set();
 s.deck.forEach(c=>{const r=route(c.id);prefSub.add(r.subtopic);prefAsp.add(r.aspect);});
 const seenAsp=new Set(s.seen.map(id=>route(id).aspect));
 return {last:last,follow:follow,lastSub:last?route(last).subtopic:null,lastAsp:last?route(last).aspect:null,prefSub:prefSub,prefAsp:prefAsp,seenAsp:seenAsp};
}
function score(s,c,ctx){
 ctx=ctx||buildContext(s);const r=route(c);
 let n=subWeight(s.goal,r.subtopic)*3;
 try{n+=routes().audienceScore(c,s.profile)||0;}catch(e){}
 if(ctx.follow.has(typeof c==='string'?c:c.id))n+=4;
 if(ctx.lastSub&&r.subtopic===ctx.lastSub)n+=2;
 if(ctx.prefSub.has(r.subtopic))n+=3;
 if(ctx.prefAsp.has(r.aspect))n+=1;
 if(s.answers.breadth==='broaden'){if(ctx.prefAsp.has(r.aspect))n-=6;if(!ctx.seenAsp.has(r.aspect))n+=6;}
 if(s.answers.empty==='general'&&(r.common||universal.indexOf(c.id)>=0))n+=5;
 if(s.answers.empty==='focus'&&subWeight(s.goal,r.subtopic))n+=3;
 return n;
}

/* ---------- 问题调度 ---------- */
function ask(s,id,extra){
 const checkpoints=ONE_TIME.indexOf(id)>=0?Array.from(new Set(s.checkpoints.concat([id]))):s.checkpoints.slice();
 return Object.assign({},s,{batch:[],pendingQuestion:id,checkpoints:checkpoints},extra||{});
}
function preQuestion(s){
 if((s.goal==='care_family'||s.goal==='family_plan')&&s.checkpoints.indexOf('care_target')<0){
  const e=CTX.elder(),p=CTX.parent();
  if((e||p)&&!(e&&s.contexts.indexOf(e)>=0)&&!(p&&s.contexts.indexOf(p)>=0))return 'care_target';
 }
 if(s.goal==='graduation'&&s.round>=2&&s.checkpoints.indexOf('grad_direction')<0)return 'grad_direction';
 if(s.goal==='stay_well'&&s.round>=1&&s.checkpoints.indexOf('age_check')<0&&ctxExists('age60plus')&&s.contexts.indexOf('age60plus')<0)return 'age_check';
 return null;
}
function contextAsk(s){
 if(s.round<2)return null;
 const last=s.lastAsk===null||s.lastAsk===undefined?-2:s.lastAsk;
 if(s.round-last<2)return null;
 const ready=pool(s).filter(c=>s.seen.indexOf(c.id)<0&&!s.deck.some(d=>d.id===c.id)&&eligible(s,c)&&relevant(s,c)).length;
 if(ready>=3)return null;
 const declined=new Set(s.declined||[]),have=new Set(s.contexts);
 for(const c of pool(s)){
  if(s.seen.indexOf(c.id)>=0||!relevant(s,c)||eligible(s,c))continue;
  let rule=null;try{rule=applicability().get(c);}catch(e){continue;}
  if(!rule||!rule.requires||rule.requires.length!==1)continue;
  const id=rule.requires[0];
  if(have.has(id)||declined.has(id)||isMedical(id))continue;
  return id;
 }
 return null;
}

/* ---------- 发牌 ---------- */
function deal(s,skipAsk){
 if(!s.profile||!s.goal||s.pendingQuestion||isComplete(s))return Object.assign({},s,{batch:[]});
 if(!skipAsk){
  const pre=preQuestion(s);if(pre)return ask(s,pre);
  const cc=contextAsk(s);if(cc)return ask(s,'context_confirm',{pendingContext:cc,lastAsk:s.round});
 }
 const ctx=buildContext(s);
 const avail=pool(s).filter(c=>s.seen.indexOf(c.id)<0&&!s.deck.some(d=>d.id===c.id)&&eligible(s,c));
 let cands;
 if(s.round<3){
  cands=avail.filter(c=>relevant(s,c)||(ctx.follow.has(c.id)&&ctx.lastAsp&&route(c).aspect===ctx.lastAsp));
  if(s.round===0){const tops=topSubs(s.goal,2),t=cands.filter(c=>tops.indexOf(route(c).subtopic)>=0);if(t.length>=3)cands=t;}
 }else if(s.answers.breadth==='follow'){
  cands=avail.filter(c=>relevant(s,c)||ctx.follow.has(c.id)||(ctx.lastAsp&&route(c).aspect===ctx.lastAsp));
 }else cands=avail;
 const ranked=cands.map((c,i)=>({c:c,n:score(s,c,ctx),i:i})).sort((a,b)=>b.n-a.n||a.i-b.i).map(o=>o.c);
 const chosen=[],subs=new Set(),used=new Set();
 for(const c of ranked){
  if(chosen.length===3)break;
  const r=route(c);
  if(s.round>0&&subs.has(r.subtopic))continue;
  chosen.push(c);subs.add(r.subtopic);used.add(c.id);
 }
 for(const c of ranked){if(chosen.length===3)break;if(!used.has(c.id)){chosen.push(c);used.add(c.id);}}
 const ids=chosen.map(c=>c.id);
 return Object.assign({},s,{batch:ids,seen:Array.from(new Set(s.seen.concat(ids))),round:s.round+(ids.length?1:0)});
}
function settle(s){const decisions=Object.assign({},s.decisions);s.batch.forEach(id=>{if(!decisions[id])decisions[id]='skip';});return Object.assign({},s,{decisions:decisions,batch:[]});}
function next(s){
 if(s.pendingQuestion)return s;
 if(isComplete(s))return settle(s);
 if(!s.batch.length)return deal(s);
 const count=s.batch.filter(id=>s.decisions[id]==='add').length;
 let r=Object.assign({},settle(s),{emptyRounds:count?0:s.emptyRounds+1});
 if(r.round>=3&&r.checkpoints.indexOf('breadth')<0)return ask(r,'breadth');
 if(r.emptyRounds>=2&&r.checkpoints.indexOf('empty')<0)return ask(r,'empty');
 return deal(r);
}

/* ---------- 选择阶段 / 目标 ---------- */
function selectProfile(s,id){
 if(id!=='any'&&!profiles.some(p=>p.id===id))throw Error('请选择当前阶段');
 const changed=s.profile!==id;
 let contexts=s.contexts.slice();
 if(changed){
  contexts=contexts.filter(x=>x!=='job_search'&&x!=='employed');
  if(id==='jobseeker'&&ctxExists('job_search'))contexts.push('job_search');
  if((id==='earlywork'||id==='working')&&ctxExists('employed')){contexts=contexts.filter(x=>x!=='unemployed');contexts.push('employed');}
 }
 return Object.assign({},settle(s),{profile:id,goal:null,need:null,pendingQuestion:null,pendingCard:null,pendingContext:null,emptyRounds:0,contexts:Array.from(new Set(contexts)),undo:null});
}
function selectNeed(s,id){
 if(!s.profile)throw Error('请先选择当前阶段');
 let goal=id;
 if(!GOALS[goal]){const map=NEED_MAP[s.profile]||NEED_MAP.any;goal=map[id];}
 if(!GOALS[goal]&&(id==='general'||id==='any'))goal=goalsFor(s.profile)[0];
 if(!GOALS[goal]||goalsFor(s.profile).indexOf(goal)<0)throw Error('请选择要解决的问题');
 let r=Object.assign({},settle(s),{goal:goal,need:goal,pendingQuestion:null,pendingCard:null,pendingContext:null,emptyRounds:0,round:0,undo:null});
 if(goal==='find_job'&&ctxExists('job_search'))r.contexts=Array.from(new Set(r.contexts.concat(['job_search'])));
 return deal(r);
}

/* ---------- 问答 ---------- */
function question(s){
 if(!s.pendingQuestion)return null;
 if(s.pendingQuestion==='applicability'){
  const card=Catalog.get(s.pendingCard),rule=applicability().get(card);
  const labels=rule.requires.map(id=>{const item=applicability().contexts.find(c=>c.id===id);return item?item.title:id;});
  return Object.assign({},QUESTIONS.applicability,{note:card.title+'\n适用前提（需要全部符合）：'+labels.join('；')});
 }
 if(s.pendingQuestion==='context_confirm'){
  const item=applicability().contexts.find(c=>c.id===s.pendingContext);
  return Object.assign({},QUESTIONS.context_confirm,{note:item?item.title:s.pendingContext});
 }
 return QUESTIONS[s.pendingQuestion];
}
function addCtx(list,id){return id?Array.from(new Set(list.concat([id]))):list.slice();}
function answer(s,id){
 const q=question(s);
 if(!q||!q.options.some(o=>o.id===id))throw Error('请选择当前问题的选项');
 let r=Object.assign({},s,{answers:Object.assign({},s.answers,{[q.id]:id}),pendingQuestion:null,pendingCard:null,pendingContext:null,emptyRounds:0});
 if(q.id==='work_context'){
  r.contexts=s.contexts.filter(x=>x!=='job_search'&&x!=='employed');
  if(id==='employed')r.contexts=r.contexts.filter(x=>x!=='unemployed');
  if(id!=='general')r.contexts=r.contexts.concat([id]);
  return deal(r,true);
 }
 if(q.id==='grad_direction'){
  if(id==='study')r.contexts=addCtx(r.contexts,CTX.study());
  if(id==='job'){r.contexts=addCtx(r.contexts,CTX.study());r.contexts=addCtx(r.contexts,ctxExists('job_search')?'job_search':null);}
  return deal(r,true);
 }
 if(q.id==='care_target'){
  if(id==='eldercare')r.contexts=addCtx(r.contexts,CTX.elder());
  if(id==='parenting')r.contexts=addCtx(r.contexts,CTX.parent());
  return deal(r,true);
 }
 if(q.id==='age_check'){
  if(id==='yes')r.contexts=addCtx(r.contexts,'age60plus');
  return deal(r,true);
 }
 if(q.id==='context_confirm'){
  if(id==='yes')r.contexts=addCtx(r.contexts,s.pendingContext);
  else r.declined=Array.from(new Set((s.declined||[]).concat([s.pendingContext])));
  return deal(r,true);
 }
 if(q.id==='applicability'){
  const card=Catalog.get(s.pendingCard);
  if(id==='confirm'){
   const rule=applicability().get(card);
   let contexts=s.contexts.slice();
   if(rule.requires.indexOf('employed')>=0)contexts=contexts.filter(x=>x!=='unemployed');
   if(rule.requires.indexOf('unemployed')>=0)contexts=contexts.filter(x=>x!=='employed');
   r.contexts=Array.from(new Set(contexts.concat(rule.requires)));
   if(!eligible(r,card))throw Error('这条建议的适用条件还未满足');
   r=collect(r,card);
   r.trail=s.trail.concat([card.id]);
   return next(r);
  }
  return deal(r,true);
 }
 if(q.id==='empty'&&id==='change')return Object.assign({},r,{goal:null,need:null,batch:[],round:0});
 return deal(r,true);
}

/* ---------- 收藏 ---------- */
function snapshot(card,estimate,old){
 const c=JSON.parse(JSON.stringify(card));delete c.text;
 c.action=c.steps&&c.steps.length?c.steps.join(' '):c.title;
 c.done=old?old.done:false;c.savedAt=old?old.savedAt:new Date().toISOString();
 c.estimate=estimate||null;return c;
}
function collect(s,card,estimate){
 const canonical=Catalog.get(card&&card.id?card.id:card);
 if(!canonical)throw Error('这张建议卡不存在');
 const old=s.deck.find(c=>c.id===canonical.id);
 if(!old&&isComplete(s))throw Error('这次已收集 10 张，可以先看看牌组。');
 if(!old&&s.archive.some(c=>c.id===canonical.id))throw Error('这条已在以前的收藏中。');
 if(estimate===undefined&&old)estimate=old.estimate;
 if(estimate){const checked=Legacy.calc(canonical.calc,estimate.values);if(checked.value!==estimate.value||checked.kind!==estimate.kind)throw Error('估算记录不正确');estimate=checked;}
 const c=snapshot(canonical,estimate,old);
 return Object.assign({},s,{deck:old?s.deck.map(x=>x.id===c.id?c:x):s.deck.concat([c]),decisions:Object.assign({},s.decisions,{[c.id]:'add'}),seen:Array.from(new Set(s.seen.concat([c.id])))});
}
function stripUndo(s){const copy=Object.assign({},s);delete copy.undo;return JSON.parse(JSON.stringify(copy));}
function pick(s,id){
 if(s.pendingQuestion||isComplete(s)||s.batch.indexOf(id)<0||s.deck.some(c=>c.id===id)||!eligible(s,id))throw Error('请从当前三张建议中选择');
 const before=stripUndo(s);
 let r=collect(s,Catalog.get(id));
 r=Object.assign({},r,{trail:s.trail.concat([id]),answers:Object.assign({},s.answers,s.answers.breadth==='broaden'?{breadth:'any'}:{})});
 r=next(r);
 return Object.assign({},r,{undo:before});
}
function undo(s){
 if(!s.undo)return s;
 return Object.assign({},s.undo,{archive:s.archive,visited:s.visited,estimates:s.estimates,undo:null});
}
function requestCard(s,id){
 const card=Catalog.get(id);
 if(!card)throw Error('这张建议卡不存在');
 if(s.deck.some(c=>c.id===id)||s.archive.some(c=>c.id===id))return s;
 if(isComplete(s))return s;
 if(!eligible(s,card))return Object.assign({},settle(s),{pendingQuestion:'applicability',pendingCard:id,pendingContext:null});
 let r=collect(s,card);
 r=Object.assign({},r,{trail:s.trail.concat([id])});
 return next(r);
}
function pass(s){if(s.pendingQuestion||isComplete(s))return s;return next(s);}
function skip(s,id){
 if(!Catalog.get(id))throw Error('这张建议卡不存在');
 if(s.deck.some(c=>c.id===id))return s;
 return Object.assign({},s,{decisions:Object.assign({},s.decisions,{[id]:'skip'}),seen:Array.from(new Set(s.seen.concat([id])))});
}
function remove(s,id){
 if(!s.deck.some(c=>c.id===id))return s;
 return Object.assign({},s,{deck:s.deck.filter(c=>c.id!==id),decisions:Object.assign({},s.decisions,{[id]:'skip'})});
}
function restart(s){
 const all=new Map();
 s.archive.concat(s.deck).forEach(c=>all.set(c.id,c));
 return Object.assign(initial(),{profile:s.profile,contexts:(s.contexts||[]).slice(),archive:Array.from(all.values())});
}

/* ---------- 可编辑的情况 ---------- */
function contextOptions(s){
 const active=new Set((s&&s.contexts)||[]);
 return applicability().contexts.filter(c=>!isMedical(c.id)).map(c=>({id:c.id,title:c.title,active:active.has(c.id)}));
}
function setContext(s,id,enabled){
 if(!ctxExists(id))throw Error('这个情况不存在');
 let contexts=s.contexts.filter(x=>x!==id);
 if(enabled){
  if(id==='employed')contexts=contexts.filter(x=>x!=='unemployed');
  if(id==='unemployed')contexts=contexts.filter(x=>x!=='employed');
  contexts=contexts.concat([id]);
 }
 let r=Object.assign({},s,{contexts:Array.from(new Set(contexts))});
 if(r.pendingQuestion==='applicability'&&(!r.pendingCard||eligible(r,r.pendingCard)))
  r=Object.assign({},r,{pendingQuestion:null,pendingCard:null});
 if(r.pendingQuestion==='context_confirm'&&r.pendingContext===id)
  r=Object.assign({},r,{pendingQuestion:null,pendingContext:null});
 if(r.pendingQuestion)return r;
 const batch=r.batch.filter(cid=>eligible(r,cid));
 if(batch.length!==r.batch.length||(!batch.length&&r.goal))return deal(settle(Object.assign({},r,{batch:batch})));
 return Object.assign({},r,{batch:batch});
}
function editWorkContext(s){return ask(settle(s),'work_context',{pendingCard:null,pendingContext:null});}

/* ---------- 校验 / 迁移 ---------- */
function object(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function unique(a){return Array.isArray(a)&&new Set(a).size===a.length;}
function validSaved(cards,limit){
 if(!Array.isArray(cards)||cards.length>limit||!unique(cards.map(c=>c&&c.id)))return false;
 return cards.every(c=>c&&!Object.prototype.hasOwnProperty.call(c,'text')&&Legacy.validate({version:2,answers:[],deck:[c],visited:[]}));
}
function validContexts(list){
 if(!unique(list)||list.some(id=>!ctxExists(id)))return false;
 if(list.indexOf('employed')>=0&&list.indexOf('unemployed')>=0)return false;
 return true;
}
function validCore(s){
 if(!validSaved(s.deck,10)||!validSaved(s.archive,Catalog.all.length+100))return false;
 if(s.deck.some(c=>!Catalog.get(c.id)||s.archive.some(a=>a.id===c.id)))return false;
 if(s.archive.some(c=>!Catalog.get(c.id)))return false;
 if(!unique(s.seen)||s.seen.some(id=>!Catalog.get(id)))return false;
 if(!object(s.decisions)||Object.keys(s.decisions).some(id=>!Catalog.get(id)||s.seen.indexOf(id)<0||['add','skip'].indexOf(s.decisions[id])<0))return false;
 if(s.deck.some(c=>s.decisions[c.id]!=='add'))return false;
 if(Object.keys(s.decisions).some(id=>s.decisions[id]==='add'&&!s.deck.some(c=>c.id===id)))return false;
 if(!unique(s.batch)||s.batch.length>3||s.batch.some(id=>!Catalog.get(id)||s.seen.indexOf(id)<0||s.archive.some(c=>c.id===id)))return false;
 if(!Array.isArray(s.visited)||!object(s.estimates))return false;
 if(!validContexts(Array.isArray(s.contexts)?s.contexts:[]))return false;
 return true;
}
function validate(s){
 if(!s||typeof s!=='object')return false;
 if([4,5,6].indexOf(s.version)>=0){
  try{
   if(!Array.isArray(s.deck)||!Array.isArray(s.archive)||!Array.isArray(s.seen)||!Array.isArray(s.batch))return false;
   if(s.profile!==null&&s.profile!==undefined&&s.profile!=='any'&&!profiles.some(p=>p.id===s.profile))return false;
   return validCore(s);
  }catch(e){return false;}
 }
 if(s.version!==7)return Legacy.validate(s);
 try{
  if(s.profile!==null&&s.profile!=='any'&&!profiles.some(p=>p.id===s.profile))return false;
  if(s.goal!==null&&(!GOALS[s.goal]||!s.profile||goalsFor(s.profile).indexOf(s.goal)<0))return false;
  if(s.need!==null&&s.need!==s.goal)return false;
  if(!validCore(s))return false;
  if(s.batch.length&&(!s.goal||!s.profile||s.pendingQuestion))return false;
  if(s.batch.some(id=>!eligible(s,id)))return false;
  if(!Array.isArray(s.trail)||s.trail.some(id=>!Catalog.get(id)||s.seen.indexOf(id)<0))return false;
  if(!Array.isArray(s.declined)||!unique(s.declined)||s.declined.some(id=>!ctxExists(id)))return false;
  if(!Number.isInteger(s.round)||s.round<0||!Number.isInteger(s.emptyRounds)||s.emptyRounds<0||s.emptyRounds>s.round)return false;
  if(!unique(s.checkpoints)||s.checkpoints.some(id=>ONE_TIME.indexOf(id)<0))return false;
  if(s.pendingQuestion!==null){
   if(!QUESTIONS[s.pendingQuestion])return false;
   if(ONE_TIME.indexOf(s.pendingQuestion)>=0&&s.checkpoints.indexOf(s.pendingQuestion)<0)return false;
  }
  if(s.pendingQuestion==='applicability'){
   const card=Catalog.get(s.pendingCard);
   if(!card||s.deck.some(c=>c.id===s.pendingCard)||s.archive.some(c=>c.id===s.pendingCard))return false;
   if(eligible(s,card)||!applicability().get(card).requires.length||isComplete(s))return false;
  }else if(s.pendingCard!==null)return false;
  if(s.pendingQuestion==='context_confirm'){if(!ctxExists(s.pendingContext)||isMedical(s.pendingContext))return false;}
  else if(s.pendingContext!==null)return false;
  if(s.lastAsk!==null&&!Number.isInteger(s.lastAsk))return false;
  if(!object(s.answers)||Object.keys(s.answers).some(id=>!QUESTIONS[id]||!QUESTIONS[id].options.some(o=>o.id===s.answers[id])))return false;
  if(s.undo!==null&&(!object(s.undo)||s.undo.undo||!Array.isArray(s.undo.deck)||!validSaved(s.undo.deck,10)))return false;
  if(typeof s.sessionId!=='string'||!s.sessionId)return false;
  return true;
 }catch(e){return false;}
}
function migrate(s){
 const profile=(s.profile==='any'||profiles.some(p=>p.id===s.profile))?s.profile:null;
 let goal=null;
 if(profile&&s.need){goal=GOALS[s.need]?s.need:((NEED_MAP[profile]||NEED_MAP.any)[s.need]||null);}
 if(goal&&goalsFor(profile).indexOf(goal)<0)goal=null;
 let contexts=(Array.isArray(s.contexts)?s.contexts:[]).filter(ctxExists);
 if(contexts.indexOf('employed')>=0&&contexts.indexOf('unemployed')>=0)contexts=contexts.filter(x=>x!=='unemployed');
 const deck=(s.deck||[]).slice(),archive=(s.archive||[]).slice();
 const seen=Array.from(new Set((s.seen||[]).filter(id=>Catalog.get(id)).concat(deck.map(c=>c.id))));
 const decisions={};Object.keys(s.decisions||{}).forEach(id=>{if(seen.indexOf(id)>=0&&['add','skip'].indexOf(s.decisions[id])>=0)decisions[id]=s.decisions[id];});
 deck.forEach(c=>{decisions[c.id]='add';});
 const answers={};Object.keys(s.answers||{}).forEach(id=>{if(QUESTIONS[id]&&QUESTIONS[id].options.some(o=>o.id===s.answers[id]))answers[id]=s.answers[id];});
 const checkpoints=(s.checkpoints||[]).filter(id=>ONE_TIME.indexOf(id)>=0);
 const trail=(s.trail||deck.map(c=>c.id)).filter(id=>Catalog.get(id)&&seen.indexOf(id)>=0);
 const st=Object.assign(initial(),{
  profile:profile,goal:goal,need:goal,contexts:Array.from(new Set(contexts)),deck:deck,archive:archive,
  seen:seen,decisions:decisions,trail:trail,round:Number.isInteger(s.round)?s.round:0,
  checkpoints:Array.from(new Set(checkpoints)),answers:answers,
  visited:Array.isArray(s.visited)?s.visited:[],estimates:object(s.estimates)?s.estimates:{}
 });
 return (st.profile&&st.goal)?deal(st):st;
}
function restore(s){
 if(!validate(s))throw Error('记录格式不完整');
 if(s.version===7)return s;
 if([4,5,6].indexOf(s.version)>=0)return migrate(s);
 const migrated=Object.assign(initial(),{archive:(s.deck||[]).map(c=>{const saved=Object.assign({},c);delete saved.text;return saved;}),visited:s.visited||[],estimates:object(s.estimates)?s.estimates:{}});
 if(s.version===3&&(s.profile==='any'||profiles.some(p=>p.id===s.profile)))migrated.profile=s.profile;
 return migrated;
}

/* ---------- 导出 ---------- */
const API={
 profiles:profiles,
 goals:GOALS,
 questions:QUESTIONS,
 universal:universal,
 initial:initial,
 goalsFor:goalsFor,
 needs:needs,
 topSubs:topSubs,
 subWeight:subWeight,
 relevant:relevant,
 pool:pool,
 coverage:coverage,
 lastPicked:lastPicked,
 isComplete:isComplete,
 recommend:recommend,
 score:score,
 deal:deal,
 next:next,
 selectProfile:selectProfile,
 selectNeed:selectNeed,
 question:question,
 answer:answer,
 collect:collect,
 pick:pick,
 undo:undo,
 requestCard:requestCard,
 pass:pass,
 skip:skip,
 remove:remove,
 restart:restart,
 contextOptions:contextOptions,
 setContext:setContext,
 editWorkContext:editWorkContext,
 eligible:eligible,
 validate:validate,
 migrate:migrate,
 restore:restore
};
root.LifeExplore=API;
root.LifeCore=Object.assign({},Legacy,{initial:initial,restore:restore,validate:validate,collect:collect});
})(typeof window!=='undefined'?window:globalThis);

