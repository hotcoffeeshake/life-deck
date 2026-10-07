(function(root){
'use strict';
const C=root.LifeContent;
function initial(){return {version:2,answers:[],deck:[],visited:[],estimates:{}};}
function stage(a){return C.stages.find(s=>s.id===a[0]);}
function goal(a){return C.goals.find(g=>g.id===a[1]);}
function domain(a){const g=goal(a);return g&&g.domains.indexOf(a[2])>=0?C.domains[a[2]]:null;}
function scene(a){const d=domain(a);return d?d.scenes.find(s=>s.id===a[3]):null;}
function question(answers){
 if(!answers.length)return {title:'旅人，你走到人生的哪一程？',note:'不用按年龄对号入座，选最贴近现在的一张。',label:'人生阶段',options:C.stages};
 const st=stage(answers);if(!st)throw Error('人生阶段无效');
 if(answers.length===1)return {title:'在这一程，你想先找到什么答案？',note:'这次先聊一件你在意的事。',label:'想找到的答案',options:st.goals};
 const g=goal(answers);if(!g)throw Error('目标无效');
 if(answers.length===2)return {title:g.id==='better'?'你最想先改善哪一部分？':g.id==='prepare'?'眼下，哪件事更值得准备？':'哪一个方向，让你想多了解一点？',note:'选一个想继续聊的方向。',label:'探索方向',options:g.domains.map(id=>Object.assign({id:id},C.domains[id]))};
 const d=domain(answers);if(!d)throw Error('方向无效');
 if(answers.length===3){const options=d.scenes.slice(),first=st.first[answers[2]],i=options.findIndex(s=>s.id===first);if(i>0)options.unshift(options.splice(i,1)[0]);return {title:d.question,note:'再了解这一点，就可以翻开为你准备的建议。',label:'具体处境',options:options};}
 if(!scene(answers)||answers.length!==4)throw Error('回答无效');return null;
}
function answer(answers,id){const q=question(answers);if(!q||!q.options.some(o=>o.id===id))throw Error('请选择当前卡片');return answers.concat([id]);}
function labelPath(a){return [stage(a),goal(a),domain(a),scene(a)].filter(Boolean).map(x=>x.label||x.title);}
function recommend(a){if(a.length!==4||question(a)!==null)throw Error('请先完成本轮选择');const s=scene(a),d=domain(a),st=stage(a);
 return s.cards.map(c=>Object.assign({},c,{stageId:st.id,stageTitle:st.title,domainId:a[2],domainTitle:d.title,sceneId:s.id,sceneTitle:s.title,chapters:s.chapters.slice(),reason:'你正处于「'+st.title+'」，这次想了解「'+s.title+'」。这三张牌从同一件事的不同角度展开。',sourceLabel:'参考《高性价比人生指南》第 '+s.chapters.join('、')+' 章；行动步骤为产品整理。',boundary:boundary(a[2])}));
}
function legacyAnswers(a){if(!a.length)return true;const g=C.goals.find(g=>g.id===a[0]);if(!g)return false;if(a.length===1)return true;if(g.domains.indexOf(a[1])<0)return false;if(a.length===2)return true;if(!C.domains[a[1]].scenes.some(s=>s.id===a[2]))return false;return a.length===3||C.priorities.some(p=>p.id===a[3]);}
function restore(data){if(!validate(data))throw Error('记录格式不完整');if(data.version===2)return data;return Object.assign({},data,{version:2,answers:[]});}
function boundary(id){if(id==='health'||id==='family')return '这是日常准备建议，不诊断疾病、不替代医疗意见。持续不适或具体照护问题应咨询专业人员。';if(['home','safety','relations','world'].indexOf(id)>=0)return '具体资格、法律和政策请以官方当前信息及专业意见核实；卡片不判断个案结果。';return '按自己的条件选择；卡片只提供行动参考，不保证收益。';}
function calc(type,values){
 const n=key=>{const v=values[key];if(v===''||v===null||v===undefined||!Number.isFinite(Number(v)))throw Error('请填写完整、有效的数字');return Number(v);};
 const bounded=(v,min,max,int)=>{if(v<min||v>max||(int&&!Number.isInteger(v)))throw Error('请检查数字范围');return v;};
 if(type==='subscription'){const fee=bounded(n('fee'),0,100000,false),months=bounded(n('months'),1,12,true);return {kind:'money',value:Math.round(fee*months*100)/100,unit:'元',label:'未来 '+months+' 个月预计减少支出',formula:fee+' 元/月 × '+months+' 个月',assumption:'仅计算已确认不用、可以取消且在所填月份不再扣费的月付订阅。不含已付费用退款。',values:values};}
 if(type==='plan'){const old=bounded(n('old'),0,100000,false),next=bounded(n('next'),0,100000,false),cost=bounded(n('cost'),0,100000,false),months=bounded(n('months'),1,12,true);const value=Math.round(((old-next)*months-cost)*100)/100;return {kind:'money',value:value,unit:'元',label:'未来 '+months+' 个月预计净支出差',formula:'('+old+' − '+next+') × '+months+' − '+cost+' 元',assumption:'已确认新套餐可办理、满足实际需要且在所填月份生效。正数表示少支出，负数表示多支出。',values:values};}
 if(type==='commute'){const minutes=bounded(n('minutes'),0,720,false),days=bounded(n('days'),1,31,true);return {kind:'time',value:Math.round(minutes*days/60*10)/10,unit:'小时/月',label:'每月预计腾出的时间',formula:minutes+' 分钟/天 × '+days+' 天 ÷ 60',assumption:'输入每天往返合计减少的分钟数；路线或安排已确认可行。不是已实际节省的时间。',values:values};}
 throw Error('此建议不提供数字估算');
}
function validate(data){if(!data||[1,2].indexOf(data.version)<0||!Array.isArray(data.answers)||data.answers.length>4||!Array.isArray(data.deck)||data.deck.length>12||!Array.isArray(data.visited))return false;try{let a=[];if(data.version===1){if(!legacyAnswers(data.answers))return false;}else data.answers.forEach(id=>{a=answer(a,id);});const ids=new Set();for(const c of data.deck){if(!c||typeof c.id!=='string'||ids.has(c.id)||typeof c.title!=='string'||typeof c.action!=='string'||!Array.isArray(c.steps)||!Array.isArray(c.chapters)||typeof c.benefit!=='string'||typeof c.sourceLabel!=='string'||typeof c.done!=='boolean')return false;ids.add(c.id);if(c.calc!==null&&c.calc!==undefined&&['subscription','plan','commute'].indexOf(c.calc)<0)return false;if(c.estimate){const e=calc(c.calc,c.estimate.values);if(e.value!==c.estimate.value||e.kind!==c.estimate.kind)return false;}}return true;}catch(e){return false;}}
function collect(state,card,estimate){if(state.deck.some(c=>c.id===card.id))return state;if(state.deck.length>=12)throw Error('牌组已有 12 条建议，先实施或移除一些，再继续收集。');const snap=JSON.parse(JSON.stringify(card));snap.action=card.steps.join(' ');snap.done=false;snap.estimate=estimate||null;snap.savedAt=new Date().toISOString();return Object.assign({},state,{deck:state.deck.concat([snap])});}
root.LifeCore={initial:initial,restore:restore,question:question,answer:answer,recommend:recommend,labelPath:labelPath,calc:calc,validate:validate,collect:collect};
})(typeof window!=='undefined'?window:globalThis);
