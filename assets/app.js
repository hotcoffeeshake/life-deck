(function(){
'use strict';
const Core=window.LifeCore,Platform=window.LifePlatform,Explore=window.LifeExplore,Routes=window.LifeRoutes;
const $=id=>document.getElementById(id),main=$('main'),mask=$('modal-mask'),modal=mask.querySelector('.modal');
const loaded=Platform.load();let state=loaded.data||Core.initial(),view='landing',busy=false,activeCard=null,returnFocus=null,toastTimer=null,posterUrl=null,modalKind='',estimateDraft=null,sourceForCard=false,readingReturn='journey',readingScroll=0,posterPages=null,posterIndex=0,libraryMode='all',suppressClickUntil=0,swipeStart=null,contextsOpen=false,undoState=null,undoTimer=null;
const esc=value=>String(value===undefined?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notify(message){$('notice').textContent=message;$('notice').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('notice').hidden=true;},4500);}
function storageWarning(text){$('storage-warning').textContent=text;$('storage-warning').hidden=false;}
function persist(){try{Platform.save(state);$('storage-warning').hidden=true;return true;}catch(e){storageWarning(e.message);return false;}}
function commit(next){state=next;return persist();}
function updateCount(){$('deck-count').textContent=state.deck.length;}
function clearUndo(){undoState=null;clearTimeout(undoTimer);const b=main.querySelector('.undo-banner');if(b)b.remove();}
function armUndo(prior){undoState=prior;clearTimeout(undoTimer);undoTimer=setTimeout(clearUndo,5000);}

function frame(content){return '<section class="stage recommend-stage">'+content+'</section>';}
function hero(){return '<div class="hero-emblem" aria-hidden="true"><svg viewBox="0 0 240 300" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="120" cy="130" r="98" stroke="#c5cdbc" stroke-width="1.5"/><circle cx="120" cy="130" r="80" stroke="#d8dcc9" stroke-width="1"/><path d="M34 206 L92 116 L124 166 L152 126 L206 206" stroke="#65765b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M42 222 C 88 194, 132 238, 198 210" stroke="#a2b093" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/><circle cx="152" cy="126" r="5" fill="#435d4c"/><path d="M120 216 l0 20" stroke="#435d4c" stroke-width="3" stroke-linecap="round"/><circle cx="120" cy="243" r="7" stroke="#435d4c" stroke-width="3"/><text x="120" y="290" text-anchor="middle" font-size="15" letter-spacing="8" fill="#737a72" font-family="serif">旅途</text></svg></div>';}
function menu(title,note,options,kind,extra){return '<section class="game-menu">'+hero()+'<div class="menu-panel"><h1 tabindex="-1">'+title+'</h1><p class="menu-note">'+note+'</p><div class="vertical-menu">'+options.map((o,i)=>'<button data-'+kind+'="'+esc(o.id)+'"><span class="menu-number">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+esc(o.title)+'</strong><small>'+esc(o.sub||'')+'</small></span><span aria-hidden="true">›</span></button>').join('')+'</div>'+(extra||'')+'</div></section>';}
function fieldHTML(label,value){if(value===null||value===undefined||value==='')return '';return '<span>'+esc(label)+' <b>'+esc(value)+'</b></span>';}
function cardHTML(c,i,full){const r=Routes.get(c),discouraged=r.discouragement;
 const a=Routes.aspectInfo(r.aspect)||{title:'',icon:'·',accent:'#52706a'};
 const costMoney=r.cost&&r.cost.money!=null?r.cost.money:null,costTime=r.cost?r.cost.time:null,costEffort=r.cost?r.cost.effort:null;
 const benefitLevel=r.benefit?r.benefit.level:null,benefitMetric=r.benefit?r.benefit.metric:null;
 return '<button class="choice-card suggestion route-card'+(full?' card-disabled':'')+(discouraged?' card-discouraged':'')+'" data-advice="'+esc(c.id)+'" '+(full?'disabled':'')+' style="--i:'+i+';--accent:'+a.accent+'" aria-label="收下建议：'+esc(c.title)+'">'
 +'<span class="card-inner"><span class="card-front">'
 +(costMoney!=null?'<span class="mana-cost" title="原文金钱成本：'+esc(costMoney)+'"><small>费用</small><b>'+esc(costMoney)+'</b></span>':'')
 +'<span class="card-seal" aria-hidden="true">'+esc(a.icon)+'</span>'
 +'<span class="card-domain"><b>'+esc(a.title)+'</b><small>'+esc(Routes.subTitle(r.subtopic))+'</small></span>'
 +(discouraged?'<span class="discourage-badge">反面清单</span>':'')
 +'<span class="card-title">'+esc(c.title)+'</span>'
 +((costTime!=null||costEffort!=null)?'<span class="cost-secondary">'+fieldHTML('时间',costTime)+fieldHTML('毅力',costEffort)+'</span>':'')
 +(full?'<span class="card-full-note">这次已经收满 10 张了</span>':'')
 +((benefitLevel!=null||benefitMetric!=null)?'<span class="card-panel">'+(benefitLevel!=null?'<span class="benefit-level"><small>收益 · '+esc(benefitLevel)+'</small><b class="benefit-stars">'+esc({'大':'★★★','中':'★★','小':'★'}[benefitLevel]||benefitLevel)+'</b></span>':'')+(benefitMetric!=null?'<span class="benefit-metric"><small>收益形式</small><b>'+esc(benefitMetric)+'</b></span>':'')+'</span>':'')
 +'</span></span></button>';}
function trayHTML(){return '<aside class="deck-tray" aria-label="本次牌组"><div class="tray-heading"><span>我的牌组 <b>'+state.deck.length+' / 10</b></span><small>'+(state.deck.length?'点已收下的牌，读完整建议':'点上方的牌，收进这里')+'</small></div><div class="tray-cards" tabindex="0" aria-label="已收下的建议，可左右滚动">'+(state.deck.length?state.deck.map((c,i)=>'<button class="mini-card" data-tray-card="'+esc(c.id)+'" aria-label="阅读：'+esc(c.title)+'"><span>'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(c.title)+'</strong></button>').join(''):'<div class="tray-empty" aria-hidden="true">'+Array.from({length:10},()=>'<i></i>').join('')+'</div>')+'</div></aside>';}
function updateTray(){const tray=main.querySelector('.deck-tray');if(tray){tray.outerHTML=trayHTML();const cards=main.querySelector('.tray-cards');cards.scrollLeft=cards.scrollWidth;}updateCount();}
function undoBannerHTML(){return undoState?'<div class="undo-banner" role="status"><span>已收进牌组</span><button data-action="undo">撤回这张牌</button></div>':'';}
function journeyPath(){const n=state.deck.length;let steps='';for(let i=0;i<10;i++)steps+='<i class="'+(i<n?'done':(i===n?'next':''))+'"></i>';return '<div class="journey-path" role="img" aria-label="旅途进度：已收 '+n+' / 10 张"><span class="journey-path-label">旅<br>途</span><div class="journey-path-steps">'+steps+'</div><b>'+n+'<small> / 10</small></b></div>';}
function deckStats(cards){
 const aspects={},levels={},gains={},points={},pits=[];let estMoney=0,estTime=0,free=0,cheap=0,total=0;
 let moneyMonth=0,timeDay=0,freeDays=0,youngYears=0;
 const LV={'大':3,'中':2,'小':1},METRIC={'金钱':'money','时间':'time','自由':'freedom','死亡率':'health'};
 const COIN={'大':500,'中':200,'小':50},MIN={'大':60,'中':30,'小':10},FREE_D={'大':4,'中':2,'小':1},YOUNG={'大':3,'中':1.5,'小':0.5};
 cards.forEach(c=>{const r=Routes.get(c);if(!r)return;
  aspects[r.aspect]=(aspects[r.aspect]||0)+1;
  if(r.discouragement||r.aspect==='safety')pits.push(c.title);
  const lv=r.benefit&&r.benefit.level,mt=r.benefit&&r.benefit.metric;
  if(lv)levels[lv]=(levels[lv]||0)+1;
  if(mt)gains[mt]=(gains[mt]||0)+1;
  if(lv&&mt&&LV[lv]&&METRIC[mt]){const key=METRIC[mt];points[key]=(points[key]||0)+LV[lv];total+=LV[lv];
   if(key==='money')moneyMonth+=COIN[lv];else if(key==='time')timeDay+=MIN[lv];else if(key==='freedom')freeDays+=FREE_D[lv];else if(key==='health')youngYears+=YOUNG[lv];}
  if(r.cost&&r.cost.money!=null){if(r.cost.money==='0')free++;else if(r.cost.money==='少')cheap++;}
  if(c.estimate){if(c.estimate.unit==='元')estMoney+=Number(c.estimate.value)||0;if(/小时/.test(c.estimate.unit))estTime+=Number(c.estimate.value)||0;}});
 const rating=total>=24?'S':total>=18?'A':total>=12?'B':'C';
 return {aspects:aspects,levels:levels,gains:gains,points:points,total:total,rating:rating,moneyMonth:moneyMonth,timeDay:timeDay,freeDays:freeDays,youngYears:Math.round(youngYears*10)/10,free:free,cheap:cheap,pits:pits,estMoney:Math.round(estMoney*100)/100,estTime:Math.round(estTime*10)/10};
}
function fmtMoney(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',');}
function fmtDay(min){if(min>=60){const h=Math.floor(min/60),m=min%60;return m?h+' 小时 '+m+' 分钟':h+' 小时';}return min+' 分钟';}
function verdictLines(st,n){
 const lines=['十张牌已集齐，旅人。'];
 lines.push('这副牌的战力评级是「'+st.rating+'」。');
 const seg=[];
 if(st.moneyMonth)seg.push('每个月多留住约 ¥'+fmtMoney(st.moneyMonth));
 if(st.timeDay)seg.push('每天赎回约 '+fmtDay(st.timeDay));
 if(st.youngYears)seg.push('身体往年轻 '+st.youngYears+' 岁的方向走');
 if(st.freeDays)seg.push('每月多出 '+st.freeDays+' 个完全属于自己的傍晚');
 if(seg.length)lines.push('照它走：'+seg.join('，')+'。');
 if(st.pits.length)lines.push('还顺手绕开 '+st.pits.length+' 个本要用钱、时间和心气才能看清的坑。');
 if(st.free||st.cheap)lines.push('其中 '+(st.free+st.cheap)+' 张几乎不用花钱就能开始——好的出发，从不等攒够钱。');
 if(st.estMoney)lines.push('你已核对的数字里，有看得见的一笔：约 ¥'+fmtMoney(st.estMoney)+'。');
 if(st.estTime)lines.push('还有每月约 '+st.estTime+' 小时，从今天起还给自己。');
 lines.push('路还长，但你手里已经有一副好牌。');
 return lines;
}
function reportHTML(){const st=deckStats(state.deck),lines=verdictLines(st,state.deck.length);
 const domains=Object.keys(st.aspects).map(id=>{const a=Routes.aspectInfo(id);return a?'<span class="report-domain" style="--accent:'+a.accent+'"><i>'+esc(a.icon)+'</i>'+esc(a.title)+' × '+st.aspects[id]+'</span>':'';}).join('');
 const pitList=st.pits.slice(0,5).map(t=>'<li>'+esc(t)+'</li>').join('');
 const GAIN_META=[['money','金钱','#a3803e'],['time','时间','#5b7183'],['freedom','自由','#71835c'],['health','健康','#a4635a']];
 const gainRows=GAIN_META.filter(g=>st.points[g[0]]).map(g=>{const pct=Math.max(6,Math.round(st.points[g[0]]/st.total*100));return '<div class="report-gain"><span>'+g[1]+'</span><div class="report-gain-bar"><i style="width:'+pct+'%;background:'+g[2]+'"></i></div><b>'+st.points[g[0]]+' 点</b></div>';}).join('');
 const tiles=[];
 if(st.moneyMonth)tiles.push(['币','¥'+fmtMoney(st.moneyMonth),'<small>/月</small>','省下来或赚回来']);
 if(st.timeDay)tiles.push(['时',fmtDay(st.timeDay),'<small>/天</small>','赎回给自己的时间']);
 if(st.youngYears)tiles.push(['龄','−'+st.youngYears+' 岁','','身体前进的方向']);
 if(st.freeDays)tiles.push(['闲',st.freeDays+' 个','<small>/月</small>','完全属于自己的傍晚']);
 if(st.pits.length)tiles.push(['盾',st.pits.length+' 个','','照做能避开的坑']);
 const hud=tiles.length?'<div class="report-hud">'+tiles.map(t=>'<div class="hud-tile"><i>'+t[0]+'</i><b>'+t[1]+(t[2]||'')+'</b><span>'+t[3]+'</span></div>').join('')+'</div>':'';
 return '<section class="journey-report"><p class="report-kicker">旅 途 结 算 <span class="report-rating r-'+st.rating+'">'+st.rating+'</span></p>'
 +'<p class="report-verdict">'+esc(lines.join(''))+'</p>'
 +hud
 +(gainRows?'<div class="report-gains"><div class="report-gains-head"><span>卡组构成</span><b>战力值 '+st.total+' · '+st.rating+' 级</b></div>'+gainRows+'</div>':'')
 +(domains?'<div class="report-domains">'+domains+'</div>':'')
 +(st.pits.length?'<div class="report-block"><h3>照做能避开的坑</h3><ul>'+pitList+(st.pits.length>5?'<li>……以及另外 '+(st.pits.length-5)+' 个</li>':'')+'</ul></div>':'')
 +'<div class="report-actions"><button class="primary-button" data-action="journey-poster">生成旅途战报图</button></div>'
 +'<p class="hint-note">金额、时间和"年轻"是把原文收益等级（小/中/大）按固定量级折算的游戏化估算，帮你感受方向，不是精算承诺；战报图适合分享，下面的行动清单适合执行。</p></section>';}
function finishChoice(){setBusy(false);view=Explore.isComplete(state)?'deck':'journey';render(true);window.scrollTo(0,0);const tray=main.querySelector('.tray-cards');if(tray)tray.scrollLeft=tray.scrollWidth;}
function pickCard(button){if(busy)return;try{const prior=state;const next=Explore.pick(state,button.dataset.advice);setBusy(true);const durable=commit(next);armUndo(prior);updateTray();button.classList.add('picked');main.querySelectorAll('[data-advice]').forEach(c=>{if(c!==button)c.classList.add('unselected');});const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;setTimeout(finishChoice,reduced?20:360);if(!durable)notify('本机保存失败，请保留页面并保存图片。');}catch(e){notify(e.message);setBusy(false);}}
function passHand(){if(busy||view!=='journey'||Explore.question(state)||!Explore.recommend(state).length)return;try{const next=Explore.pass(state);setBusy(true);commit(next);const table=main.querySelector('.card-table');if(table)table.classList.add('hand-passed');setTimeout(finishChoice,window.matchMedia('(prefers-reduced-motion: reduce)').matches?20:220);}catch(e){notify(e.message);setBusy(false);}}
function contextPanel(){if(!Explore.contextOptions)return '';const options=Explore.contextOptions(state);if(!options.length)return '';return '<div class="context-editor '+(contextsOpen?'open':'')+'"><button class="text-button" data-action="toggle-context">补充我的处境</button>'+(contextsOpen?'<div class="context-list">'+options.map(o=>'<button class="context-chip" data-context="'+esc(o.id)+'" data-active="'+(o.active?'1':'0')+'" aria-pressed="'+(o.active?'true':'false')+'">'+esc(o.title)+(o.active?' ✓':'')+'</button>').join('')+'</div>':'')+'</div>';}
function progress(){return '<div class="collect-progress"><span>本次牌组 <b>'+state.deck.length+' / 10</b></span><progress max="10" value="'+state.deck.length+'" aria-label="本次收集进度"></progress></div>';}
function renderLanding(){main.innerHTML=menu('旅人，你正站在人生的哪一程？','不用按年龄对号入座，选最贴近此刻的一站。',Explore.profiles,'profile','<div class="menu-links"><button class="text-button" data-profile="any">先随便走走</button>'+(state.need||state.deck.length?'<button class="text-button" data-action="resume">继续上次的旅途</button>':'')+(state.archive.length?'<button class="text-button" data-action="archive">上一段旅途的牌组（'+state.archive.length+' 张）</button>':'')+'</div>');}
function render(focus){document.body.classList.toggle('has-tray',view==='journey'&&!!state.profile&&!!state.need&&!Explore.isComplete(state));updateCount();if(view==='landing'){renderLanding();return;}if(view==='reading'){showDetail(activeCard,true);return;}if(view==='deck'||view==='archive'){renderDeck();return;}if(view==='library'){renderLibrary();return;}if(!state.profile){renderLanding();return;}
 if(Explore.isComplete(state)){view='deck';renderDeck();return;}
 const q=Explore.question(state);
 if(!state.need){const needs=Explore.needs(state);main.innerHTML=menu(esc(needs.title),'选一个这次想找到的答案。',needs.options,'need','<div class="menu-links"><button class="text-button" data-action="landing">← 重选所在的一程</button></div>');}
 else if(q){main.innerHTML=frame('<h1 tabindex="-1">'+esc(q.title)+'</h1>'+(q.note?'<p class="stage-sub context-note">'+esc(q.note)+'</p>':'')+undoBannerHTML()+'<div class="probe-options">'+q.options.map(o=>'<button data-answer="'+esc(o.id)+'"><strong>'+esc(o.title)+'</strong></button>').join('')+'</div>')+trayHTML();}
 else{const cards=Explore.recommend(state),full=Explore.isComplete(state);main.innerHTML=frame('<div class="survey-top"><button class="back-button" data-action="change-need">← 换个方向</button>'+contextPanel()+'<button class="text-button" data-action="card-key">卡面读法</button></div><h1 tabindex="-1">'+(cards.length?'前方三张牌，收哪张上路？':'这一段路的牌都翻过了。')+'</h1><p class="stage-sub">'+(cards.length?'点一张收进牌组；都不想要，向左划过这组。':'可以回看看过的牌。')+'</p>'+journeyPath()+undoBannerHTML()+'<div class="card-table suggestion-table interest-cards route-hand" tabindex="0" aria-label="建议卡组；点击一张收下，向左滑动或按左方向键换牌">'+cards.map((c,i)=>cardHTML(c,i,full)).join('')+'</div>'+(cards.length?'':'<div class="browse-actions"><button class="text-button" data-action="revisit">回看看过的牌</button><button class="text-button" data-action="change-need">换个方向</button><button class="text-button" data-action="all-library">翻看全部建议</button></div>'))+trayHTML();}
 if(focus){const h=main.querySelector('h1');if(h)h.focus({preventScroll:true});}}
function renderLibrary(){const cards=libraryMode==='skipped'?LifeCatalog.all.filter(c=>state.decisions&&state.decisions[c.id]==='skip'):LifeCatalog.all;main.innerHTML='<section class="collection library"><button class="back-button" data-action="resume">← 返回收集</button><h1 tabindex="-1">'+(libraryMode==='skipped'?'看过的牌':'全部建议')+'</h1><p class="library-note">'+(cards.length?'共 '+cards.length+' 条。需要特定情境的建议会先确认；收下后从牌组看全文。':'还没有可回看的卡。')+'</p><div class="library-list">'+cards.map(c=>'<article><div><span class="library-chapter">第 '+c.chapterId+' 章 · '+esc(c.chapterTitle)+'</span><button data-open-source="'+c.id+'">'+esc(c.title)+'</button>'+(state.deck.some(x=>x.id===c.id)?'<small>已加入本次牌组</small>':state.archive.some(x=>x.id===c.id)?'<small>在以前的牌组里</small>':'')+'</div><span aria-hidden="true">↗</span></article>').join('')+'</div>'+(libraryMode==='skipped'?'<button class="text-button" data-action="all-library">查看全部 '+LifeCatalog.all.length+' 条建议</button>':'')+'</section>';}
function renderDeck(){const archived=view==='archive',cards=archived?state.archive:state.deck,complete=Explore.isComplete(state),completed=cards.filter(c=>c.done).length;main.innerHTML='<section class="collection"><button class="back-button" data-action="'+(archived?'collection':'resume')+'">← '+(archived?'本次牌组':'继续旅途')+'</button><div class="collection-head"><h1 tabindex="-1">'+(archived?'上一段旅途的牌组':complete?'十张牌已集齐':'本次牌组')+'</h1><p>'+(archived?'原来的收藏、完成记录和估算都在这里。':complete?'先看这段旅途的结算，再挑一条开始上路。':'已收下 '+cards.length+' 张牌。随时可以回来，把这段旅途走完（10 张）。')+'</p></div>'+(!archived&&complete?reportHTML():'')+(!archived?undoBannerHTML():'')+(!archived?progress():'')+(cards.length?'<div class="summary-strip"><span>'+cards.length+' 张建议 · '+completed+' 条已完成</span></div><div class="collected-list">'+cards.map((c,i)=>'<article class="collected-row"><span class="collected-number">'+String(i+1).padStart(2,'0')+'</span><div><h2>'+esc(c.title)+'</h2>'+(c.estimate?'<p class="estimate-line">'+esc(c.estimate.label)+'：'+esc(c.estimate.value)+' '+esc(c.estimate.unit)+'</p>':'')+'<div class="row-actions"><button data-open-saved="'+esc(c.id)+'">'+(complete&&!archived?'从这条开始上路':'展开完整建议')+'</button>'+(!archived?'<button data-remove="'+esc(c.id)+'">移出牌组</button>':'')+'</div></div><button class="done-button" data-done="'+esc(c.id)+'" aria-pressed="'+!!c.done+'" aria-label="'+esc(c.title)+(c.done?'，标为未完成':'，标为已完成')+'">'+(c.done?'✓':'○')+'</button></article>').join('')+'</div>':'<div class="empty"><p>点选一张建议，就会收进这里。</p></div>')+(!archived?'<div class="collection-actions">'+(cards.length?'<button class="primary-button" data-action="poster">保存行动清单图</button>':'')+'<button class="secondary-button" data-action="'+(complete?'new-session':'resume')+'">'+(complete?'再走一段旅途':'继续收集')+'</button></div><p class="hint-note">选择已保存在当前设备。也可以保存成图片。</p>':'')+'<div class="menu-links">'+(!archived&&state.archive.length?'<button class="text-button" data-action="archive">上一段旅途的牌组（'+state.archive.length+' 张）</button>':'')+'<button class="text-button" data-action="all-library">全部建议</button></div></section>';}
function setBusy(on){busy=on;document.querySelectorAll('.topbar button,.stage button').forEach(b=>{b.disabled=on;});}
function openModal(html,kicker){if(mask.hidden)returnFocus=document.activeElement;modalKind=kicker; $('modal-kicker').textContent=kicker;$('modal-content').innerHTML=html;mask.hidden=false;document.body.style.overflow='hidden';modal.scrollTop=0;modal.focus();}
function closeModal(){mask.hidden=true;document.body.style.overflow='';posterUrl=null;if(returnFocus&&document.contains(returnFocus))returnFocus.focus();else{const h=main.querySelector('h1');if(h)h.focus();}}
function calcFields2(){return {subscription:[['fee','确认不再扣费的月费（元）',0,100000],['months','未来生效月数（1～12）',1,12]],plan:[['old','原套餐每月总费（元）',0,100000],['next','新套餐每月总费（元）',0,100000],['cost','一次性变更费用（元）',0,100000],['months','未来生效月数（1～12）',1,12]],commute:[['minutes','每天往返合计减少（分钟）',0,720],['days','每月通勤天数（1～31）',1,31]]};}
function calcMarkup(card){if(!card.calc)return '';const fields=calcFields2()[card.calc],prior=estimateDraft&&estimateDraft.values||{};return '<details class="calc" '+(estimateDraft?'open':'')+'><summary>用自己的数字算一算</summary><p>可跳过。只用你核对后的数字，不预填节省金额。</p><div class="calc-grid">'+fields.map(f=>'<label>'+f[1]+'<input inputmode="decimal" type="number" data-field="'+f[0]+'" min="'+f[2]+'" max="'+f[3]+'" step="'+(['months','days'].indexOf(f[0])>=0?'1':'0.01')+'" value="'+esc(prior[f[0]]===undefined?'':prior[f[0]])+'"></label>').join('')+'</div><label class="confirm-estimate"><input id="estimate-confirm" type="checkbox" '+(estimateDraft?'checked':'')+'><span>我已核对这些数字，并确认调整或取消可以在所填期间生效。</span></label><button class="secondary-button" data-action="calculate">记录条件估算</button><p class="calc-error" id="calc-error" role="status"></p><div id="calc-result">'+estimateHTML(estimateDraft)+'</div></details>';}
function estimateHTML(e){return e?'<div class="calc-result"><strong>'+esc(e.label)+'：'+esc(e.value)+' '+esc(e.unit)+'</strong><p>'+esc(e.formula)+'</p><p>'+esc(e.assumption)+'</p><button class="text-button" data-action="clear-estimate">移除估算</button></div>':'';}
function sourceText(text,omitHeading){return LifeReading.displayText(text,omitHeading).split('\n').map(line=>{const h=line.match(/^(#{1,6}) (.*)$/);if(h)return '<h3>'+esc(h[2])+'</h3>';if(!line)return '<div class="paragraph-space"></div>';let safe=esc(line).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');safe=safe.replace(/^- ([^：:]{1,12})[：:]/,'<strong>$1：</strong>');return '<p>'+safe+'</p>';}).join('');}
function showDetail(card,retainEstimate){document.body.classList.remove('has-tray');card=Object.assign({},card,{sourceLabel:LifeReading.sourceLabel(card)});activeCard=card;if(!retainEstimate){const saved=state.deck.concat(state.archive).find(c=>c.id===card.id);estimateDraft=saved?saved.estimate:null;readingReturn=['deck','archive','library'].includes(view)?view:'journey';readingScroll=0;}if(!mask.hidden)closeModal();view='reading';const sections=LifeReading.sections(card);const r=Routes.get(card),discouraged=r&&r.discouragement;
 main.innerHTML='<section class="reading-page"><div class="reading-nav"><button class="back-button" data-action="reading-back">← '+(['deck','archive'].includes(readingReturn)?'返回我的牌组':readingReturn==='library'?'返回列表':'继续收牌')+'</button><span class="eyebrow">完整建议</span></div><article class="reading-paper '+(card.sourceOriginal?'original-paper':'')+'"><header>'+(discouraged?'<p class="discourage-badge">反面清单</p>':'')+(card.sourceOriginal?'<p class="source-location">第 '+sections[0].chapterId+' 章 · '+esc(sections[0].chapterTitle)+'</p>':'')+'<h1 tabindex="-1">'+esc(card.title)+'</h1></header>'+'<section class="original-advice">'+sections.map(part=>'<section class="source-section">'+(card.sourceOriginal?'':'<p class="source-location">第 '+part.chapterId+' 章 · '+esc(part.chapterTitle)+'</p>')+'<div class="source-render">'+sourceText(part.text,card.sourceOriginal)+'</div><p class="source-url">原文位置：'+esc(part.url)+'</p></section>').join('')+'</section>'+(discouraged?'<p class="discourage-note">原文估算的是做这件事的代价，不代表你个人的收益。</p>':'')+calcMarkup(card)+'<p class="boundary">'+esc(card.boundary||'')+' 原文按仓库快照保留，来源分级为作者分级；本产品未逐条独立核验。</p><button class="source-button" data-action="sources">查看相关章节全文与出处 ↗</button><div class="reading-actions"><button class="secondary-button" data-action="reading-poster">保存完整阅读页</button><button class="text-button" data-action="reading-back">返回看其他建议</button></div></article></section>';
 updateCount();if(retainEstimate){window.scrollTo(0,readingScroll);}else{window.scrollTo(0,0);main.querySelector('h1').focus({preventScroll:true});}}
function saveEstimate(){try{if(state.deck.some(c=>c.id===activeCard.id))commit(Core.collect(state,activeCard,estimateDraft));else if(state.archive.some(c=>c.id===activeCard.id))commit(Object.assign({},state,{archive:state.archive.map(c=>c.id===activeCard.id?Object.assign({},c,{estimate:estimateDraft}):c)}));}catch(e){notify(e.message);}}
function showCardKey(){openModal('<h2 id="modal-title">卡面读法</h2><dl class="card-key"><dt>左上角 · 费用</dt><dd>原文标注的金钱成本：0、少、多。没标注不显示。</dd><dt>标题下方 · 时间与毅力</dt><dd>时间：少、中、多。毅力：否、些、是。</dd><dt>底部 · 收益面板</dt><dd>收益等级：小 ★、中 ★★、大 ★★★。收益形式：健康、时间、金钱、自由。</dd><dt>右上角 · 印章</dt><dd>这张牌所属的领域：钱、业、时、身、家、缘、盾、择。</dd></dl><p class="boundary">这些等级来自原文；牌组页的收益点数只是把等级加起来方便直观比较，不是分数或收益承诺，具体条件在卡片全文里。标了“反面清单”的牌是劝你别做的，成本读法是做这件事的代价，不改原文数字。</p>','卡面读法');}
function showSources(ids){sourceForCard=!!ids;readingScroll=window.scrollY;const chapters=LifeSources.chapters.filter(c=>!ids||ids.indexOf(c.id)>=0);openModal('<h2 id="modal-title">资料与出处</h2><p class="lead">以下是相关仓库章节，保留原文和来源备注；原文的证据等级属于作者分级。</p><p class="boundary">资料快照：'+LifeSources.date+'。政策、金额和适用条件可能变化。请在原始官方渠道核实；有争议或待核实内容不作为个人结论。</p><div class="source-list">'+chapters.map(c=>'<button data-chapter="'+c.id+'">'+c.id+'. '+esc(c.title)+' →</button>').join('')+'</div><div class="modal-actions"><button class="secondary-button" data-action="'+(sourceForCard?'detail-return':'about')+'">← '+(sourceForCard?'返回建议':'返回说明')+'</button></div>','离线资料');}
function showChapter(id){const c=LifeSources.chapters.find(c=>c.id===id);if(!c)return;openModal('<h2 id="modal-title">'+esc(c.title)+'</h2><p class="lead">仓库原文 · 非本产品独立核验结论</p><p class="boundary">以下内容保留原有来源和备注，不能直接作为个人医疗、法律或财务结论。离线容器不打开外部链接，地址以文字展示。</p><pre class="source-pre">'+esc(c.url)+'\n\n'+esc(c.text)+'</pre><button class="secondary-button" data-action="sources">← 返回章节</button>','原始资料');}
function showAbout(){sourceForCard=false;openModal('<h2 id="modal-title">怎么用</h2><p class="lead">先选人生阶段和目标，再边看建议，边收集自己的 10 张牌。</p><ol class="action-steps"><li>每次三张。点一张便收进底部牌组，自动出现下一步；再点牌组里的卡看全文。都不想要时，向左划过整组。</li><li>收下 5 秒内可以撤回，撤回不会改变之后的推荐偏好。</li><li>需要特定情境的建议，确认符合后才推荐。卡面等级取自原文，没标注的不显示。</li><li>共 '+LifeCatalog.all.length+' 条原文建议。原文的来源和备注完整保留。</li><li>金额估算只用你填写的数字，不会自动保证能省多少钱。</li><li>收藏和回答保存在这台设备。清理缓存前，可以把需要的正文保存成图片。</li></ol><p class="boundary">原文没有经过逐条专业核验。遇到医疗、法律或财务问题，还要核实是否适用于自己。</p><button class="secondary-button" data-action="all-sources">查看原始章节</button>','使用说明');}
function showJourneyPoster(){try{const st=deckStats(state.deck);posterUrl=Platform.journeyPoster(state.deck,st,verdictLines(st,state.deck.length));openModal('<h2 id="modal-title">旅途战报</h2><p class="lead">1080 × 1440，适合发到小红书。等级与收益形式来自原文，不是收益承诺。</p><div class="poster-scroll"><img class="poster-image" id="poster-image" alt="我的旅途战报" src="'+posterUrl+'"></div><div class="modal-actions"><button class="primary-button" data-action="save-image" id="save-image">保存到相册</button><button class="secondary-button" data-action="close">返回牌组</button></div><p id="save-status" class="boundary" role="status">小红书内可调用相册保存；浏览器内提供图片预览，可使用浏览器的图片保存功能。</p>','旅途战报');}catch(e){notify(e.message);}}
function showPoster(){try{posterUrl=Platform.poster(state.deck,'我的行动牌组 · '+state.deck.length+' 条建议');openModal('<h2 id="modal-title">保存建议清单</h2><p class="lead">这是牌组的行动清单图片。每条建议的完整原文，可在阅读页单独保存。</p><div class="poster-scroll"><img class="poster-image" id="poster-image" alt="我的行动卡片" src="'+posterUrl+'"></div><div class="modal-actions"><button class="primary-button" data-action="save-image" id="save-image">保存到相册</button><button class="secondary-button" data-action="close">返回牌组</button></div><p id="save-status" class="boundary" role="status">小红书内可调用相册保存；浏览器内提供图片预览，可使用浏览器的图片保存功能。</p>','我的行动卡');}catch(e){notify(e.message);}}
function showReadingPoster(){try{readingScroll=window.scrollY;posterPages=Platform.readingPages(Object.assign({},activeCard,{estimate:estimateDraft}));posterIndex=0;renderReadingPoster();}catch(e){notify(e.message);}}
function renderReadingPoster(){posterUrl=Platform.readingPage(posterPages,posterIndex);openModal('<h2 id="modal-title">保存完整正文</h2><p class="lead">正文、来源和备注完整保留。长文分成 '+posterPages.length+' 张图片，请逐页保存。</p><div class="poster-pagination"><button data-action="poster-prev" '+(posterIndex===0?'disabled':'')+'>← 上一页</button><span>'+(posterIndex+1)+' / '+posterPages.length+'</span><button data-action="poster-next" '+(posterIndex===posterPages.length-1?'disabled':'')+'>下一页 →</button></div><div class="poster-scroll"><img class="poster-image" id="poster-image" src="'+posterUrl+'" alt="完整建议，第 '+(posterIndex+1)+' 页"></div><div class="modal-actions"><button class="primary-button" data-action="save-image" id="save-image">保存第 '+(posterIndex+1)+' 页到相册</button><button class="secondary-button" data-action="close">返回阅读</button></div><p id="save-status" class="boundary" role="status">当前预览第 '+(posterIndex+1)+' 页；浏览器预览不会写入相册。</p>','完整建议图片');}
function onAction(action){if(busy)return;
 if(action==='landing'){view='landing';render();window.scrollTo(0,0);return;}
 if(action==='toggle-context'){contextsOpen=!contextsOpen;render(false);return;}
 if(action==='undo'){if(!undoState)return;clearTimeout(undoTimer);state=undoState;persist();undoState=null;updateTray();view='journey';render(true);window.scrollTo(0,0);return;}
 if(action==='change-need'){commit(Explore.selectProfile(state,state.profile));view='journey';render(true);window.scrollTo(0,0);return;}
 if(action==='new-session'){commit(Explore.restart(state));view='journey';render(true);window.scrollTo(0,0);return;}
 if(action==='all-library'||action==='revisit'){libraryMode=action==='revisit'?'skipped':'all';view='library';render(true);window.scrollTo(0,0);return;}
 if(action==='archive'){view='archive';render();window.scrollTo(0,0);return;}
 if(action==='reading-back'){view=readingReturn;render(true);window.scrollTo(0,0);return;}
 if(action==='reading-poster'){showReadingPoster();return;}
 if(action==='poster-prev'||action==='poster-next'){posterIndex+=action==='poster-next'?1:-1;renderReadingPoster();return;}
 if(action==='collection'){view='deck';render();window.scrollTo(0,0);return;}
 if(action==='resume'){if(state.need&&!Explore.question(state)&&!Explore.isComplete(state)&&!state.batch.length)commit(Explore.next(state));view='journey';render(true);window.scrollTo(0,0);return;}
 if(action==='close'){closeModal();return;}
 if(action==='about'){showAbout();return;}
 if(action==='card-key'){showCardKey();return;}
 if(action==='all-sources'){showSources();return;}
 if(action==='sources'){showSources((mask.hidden?view==='reading':sourceForCard)&&activeCard?LifeReading.chapterIds(activeCard):null);return;}
 if(action==='detail-return'){showDetail(activeCard,true);return;}
 if(action==='calculate'){clearUndo();try{if(!$('estimate-confirm').checked)throw Error('请先核对数字，并确认可以生效。');const values={};document.querySelectorAll('[data-field]').forEach(el=>{values[el.dataset.field]=el.value;});estimateDraft=Core.calc(activeCard.calc,values);$('calc-error').textContent='';$('calc-result').innerHTML=estimateHTML(estimateDraft);saveEstimate();}catch(e){$('calc-error').textContent=e.message;}return;}
 if(action==='clear-estimate'){clearUndo();estimateDraft=null;$('calc-result').innerHTML='';$('estimate-confirm').checked=false;saveEstimate();return;}
 if(action==='poster'){showPoster();return;}
 if(action==='journey-poster'){showJourneyPoster();return;}
 if(action==='save-image'){const btn=$('save-image'),savingUrl=posterUrl;btn.disabled=true;$('save-status').textContent='正在请求保存…';Platform.saveImage(posterUrl).then(r=>{const status=$('save-status');if(status&&posterUrl===savingUrl)status.textContent=r.saved?'已保存到相册。':'当前是浏览器预览，未写入相册。可使用浏览器的图片保存功能；小红书内可点击保存。';}).catch(e=>{const status=$('save-status');if(status&&posterUrl===savingUrl)status.textContent=e.message;}).then(()=>{const b=$('save-image');if(b&&posterUrl===savingUrl)b.disabled=false;});return;}
}
main.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||busy||b.disabled||Date.now()<suppressClickUntil)return;
 if(b.dataset.profile){clearUndo();commit(Explore.selectProfile(state,b.dataset.profile));view='journey';render(true);window.scrollTo(0,0);}
 else if(b.dataset.need){clearUndo();commit(Explore.selectNeed(state,b.dataset.need));render(true);window.scrollTo(0,0);}
 else if(b.dataset.answer){clearUndo();commit(Explore.answer(state,b.dataset.answer));render(true);window.scrollTo(0,0);}
 else if(b.dataset.context){clearUndo();commit(Explore.setContext(state,b.dataset.context,b.dataset.active!=='1'));render(false);}
 else if(b.dataset.advice){pickCard(b);}
 else if(b.dataset.trayCard){const c=state.deck.find(c=>c.id===b.dataset.trayCard);if(c)showDetail(c);}
 else if(b.dataset.openSource){const c=LifeCatalog.get(b.dataset.openSource);if(state.deck.concat(state.archive).some(x=>x.id===c.id)||Explore.isComplete(state))showDetail(c);else{try{clearUndo();commit(Explore.requestCard(state,c.id));view=Explore.isComplete(state)?'deck':'journey';render(true);window.scrollTo(0,0);}catch(e){notify(e.message);}}}
 else if(b.dataset.openSaved){showDetail((view==='archive'?state.archive:state.deck).find(c=>c.id===b.dataset.openSaved));}
 else if(b.dataset.done){clearUndo();const key=view==='archive'?'archive':'deck';commit(Object.assign({},state,{[key]:state[key].map(c=>c.id===b.dataset.done?Object.assign({},c,{done:!c.done}):c)}));render();}
 else if(b.dataset.remove){const c=state.deck.find(c=>c.id===b.dataset.remove);if(window.confirm('将「'+c.title+'」移出牌组？')){clearUndo();commit(Explore.remove(state,c.id));render();}}
 else if(b.dataset.action)onAction(b.dataset.action);
});
// Only a clear horizontal swipe passes a hand; taps and vertical scrolling never do.
main.addEventListener('pointerdown',event=>{suppressClickUntil=0;const hand=event.target.closest('.route-hand');if(!hand||busy||event.isPrimary===false)return;swipeStart={x:event.clientX,y:event.clientY,id:event.pointerId,hand:hand};});
main.addEventListener('pointerup',event=>{const start=swipeStart;swipeStart=null;if(!start||event.pointerId!==start.id||!document.contains(start.hand))return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)>20||Math.abs(dy)>20)suppressClickUntil=Date.now()+500;if(dx<-65&&Math.abs(dx)>Math.abs(dy)*1.6){suppressClickUntil=Date.now()+500;passHand();}});
main.addEventListener('pointercancel',()=>{swipeStart=null;});
main.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'&&event.target.closest('.route-hand')){event.preventDefault();passHand();}});
mask.addEventListener('click',event=>{if(event.target===mask){closeModal();return;}const b=event.target.closest('button');if(!b)return;if(b.dataset.chapter)showChapter(Number(b.dataset.chapter));else if(b.dataset.action)onAction(b.dataset.action);});
document.addEventListener('input',event=>{if(event.target.matches('[data-field]')){estimateDraft=null;const r=$('calc-result');if(r)r.innerHTML='';const check=$('estimate-confirm');if(check)check.checked=false;}});
document.addEventListener('keydown',event=>{if(mask.hidden)return;if(event.key==='Escape'){closeModal();return;}if(event.key==='Tab'){const focusables=Array.from(modal.querySelectorAll('button:not(:disabled),input,summary,[tabindex="0"]')).filter(e=>e.getClientRects().length);const first=focusables[0],last=focusables[focusables.length-1];if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal)){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
$('modal-close').addEventListener('click',closeModal);$('deck-button').addEventListener('click',()=>onAction('collection'));$('home-button').addEventListener('click',()=>onAction('landing'));$('about-button').addEventListener('click',showAbout);
render();if(loaded.migrated)notify('记录已更新，原来的牌组已保留。');if(loaded.error)storageWarning(loaded.error);
})();
