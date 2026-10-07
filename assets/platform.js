(function(root){
'use strict';
const KEY='life-deck.v1';let readBlocked=false;
function load(){try{const raw=root.localStorage.getItem(KEY);if(raw===null)return {data:null,error:null};const data=JSON.parse(raw);if(!root.LifeCore.validate(data))throw Error('记录格式不完整');return {data:root.LifeCore.restore(data),error:null,migrated:data.version!==root.LifeCore.initial().version};}catch(e){readBlocked=true;return {data:null,error:'原有记录无法读取，未覆盖。你可以体验本次旅程并导出图片；请保留原数据。'};}}
function save(data){if(readBlocked)throw Error('原有记录无法读取，本次未写入；请先保存图片。');try{root.localStorage.setItem(KEY,JSON.stringify(data));}catch(e){throw Error('本机记录保存失败。本次内容仍在页面中，请保存图片后再离开。');}}
function lines(c,text,width){const result=[];let line='';for(const char of String(text||'')){if(char==='\n'||c.measureText(line+char).width>width){result.push(line);line=char==='\n'?'':char;}else line+=char;}if(line)result.push(line);return result;}
function poster(cards,summary){if(!cards.length)throw Error('先收下一条建议，再制作行动卡。');if(cards.length>12)throw Error('一次最多导出 12 条建议。');const canvas=document.createElement('canvas');canvas.width=1080;const c=canvas.getContext('2d');if(!c)throw Error('当前环境无法生成图片');const sections=[];let height=290;
 cards.forEach((card,i)=>{const rows=[];function add(text,size,color,gap){c.font=size+'px sans-serif';const ls=lines(c,text,900);rows.push({lines:ls,size:size,color:color,gap:gap});height+=ls.length*(size+12)+gap;}
 height+=52;add((i+1<10?'0':'')+(i+1)+'  '+card.title,40,'#202528',20);add(card.done?'状态：已完成':'状态：准备实施',23,'#65716f',15);(card.steps||[card.action]).forEach((s,j)=>add((j+1)+'. '+s,28,'#343d3a',12));if(!card.sourceOriginal)add('可能改善：'+card.benefit,25,'#53615c',12);if(card.estimate){const e=card.estimate;add(e.label+'：'+e.value+' '+e.unit,30,'#354d43',10);add('口径：'+e.formula+'。'+e.assumption,23,'#65716f',12);}add(root.LifeReading?root.LifeReading.sourceLabel(card):card.sourceLabel,21,'#747a76',12);add(card.boundary||'行动参考，不保证收益。',21,'#747a76',18);sections.push(rows);height+=18;});
 canvas.height=height+150;c.fillStyle='#f4f1e9';c.fillRect(0,0,1080,canvas.height);c.fillStyle='#232d28';c.fillRect(0,0,1080,12);c.font='52px serif';c.fillText('人生之书',84,105);c.font='25px sans-serif';c.fillStyle='#626b65';c.fillText('行动清单',84,157);c.font='23px sans-serif';c.fillText(summary||'我的行动牌组 · '+cards.length+' 条建议',84,210);let y=290;
 sections.forEach(rows=>{c.strokeStyle='#c5c9bf';c.beginPath();c.moveTo(84,y-15);c.lineTo(996,y-15);c.stroke();y+=52;rows.forEach(row=>{c.font=row.size+'px sans-serif';c.fillStyle=row.color;row.lines.forEach(line=>{c.fillText(line,84,y);y+=row.size+12;});y+=row.gap;});y+=18;});c.font='22px sans-serif';c.fillStyle='#65716f';c.fillText('自己核对数字后再估算，金额不是收益承诺',84,y+45);c.fillText('原文来自 HowToLiveBetter；旧版行动步骤另有标注',84,y+85);return canvas.toDataURL('image/png');
}
function readingPages(card){
 const canvas=document.createElement('canvas');canvas.width=1080;const c=canvas.getContext('2d');if(!c)throw Error('当前环境无法生成图片');const rows=[];
 function add(text,size,color){c.font=size+'px sans-serif';String(text).split('\n').forEach(paragraph=>{const wrapped=lines(c,paragraph,888);if(!wrapped.length)rows.push({text:'',size:14,color:color});wrapped.forEach(text=>rows.push({text:text,size:size,color:color}));});rows.push({text:'',size:16,color:color});}
 if(card.sourceOriginal){add(card.title,40,'#29332f');}else{add(root.LifeReading.question(card),40,'#29332f');add(card.title,33,'#29332f');add(root.LifeReading.note(card),24,'#737a72');}
 root.LifeReading.sections(card).forEach(part=>{add('第 '+part.chapterId+' 章 · '+part.chapterTitle,27,'#435d4c');add(root.LifeReading.displayText(part.text,card.sourceOriginal),27,'#29332f');add('原文位置：'+part.url,21,'#737a72');});
 if(!card.sourceOriginal)add('行动步骤 · 产品整理',30,'#435d4c');card.steps.forEach((step,i)=>add((i+1)+'. '+step,27,'#29332f'));if(!card.sourceOriginal)add('可能带来的改善：'+card.benefit,27,'#29332f');
 if(card.estimate)add(card.estimate.label+'：'+card.estimate.value+' '+card.estimate.unit+'\n'+card.estimate.formula+'\n'+card.estimate.assumption,26,'#435d4c');
 add((card.sourceOriginal?'原文来自 HowToLiveBetter。':root.LifeReading.sourceLabel(card))+'\n'+card.boundary+'\n原文按仓库快照保留，作者分级不代表本产品独立核验。',22,'#737a72');
 const pages=[];let current=[],height=0;rows.forEach(row=>{const h=row.size+17;if(height+h>1250&&current.length){pages.push(current);current=[];height=0;}current.push(row);height+=h;});if(current.length)pages.push(current);return pages;
}
function readingPage(pages,index){if(!pages[index])throw Error('页面不存在');const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1560;const c=canvas.getContext('2d');c.fillStyle='#faf8f0';c.fillRect(0,0,1080,1560);c.fillStyle='#435d4c';c.font='24px sans-serif';c.fillText('人生之书 · 完整阅读页',96,70);let y=130;pages[index].forEach(row=>{c.font=row.size+'px sans-serif';c.fillStyle=row.color;c.fillText(row.text,96,y);y+=row.size+17;});c.fillStyle='#737a72';c.font='23px sans-serif';c.fillText('第 '+(index+1)+' / '+pages.length+' 页 · 请保存所有页以保留完整内容',96,1495);return canvas.toDataURL('image/png');}
function journeyPoster(cards,stats,verdict){
 if(!cards.length)throw Error('先收下一张牌，再生成战报。');
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const c=canvas.getContext('2d');if(!c)throw Error('当前环境无法生成图片');
 const aspectList=Object.keys(stats.aspects).map(id=>{const a=root.LifeRoutes&&root.LifeRoutes.aspectInfo(id);return a?{icon:a.icon,title:a.title,accent:a.accent,n:stats.aspects[id]}:null;}).filter(Boolean);
 c.fillStyle='#f4f1e9';c.fillRect(0,0,1080,1440);c.fillStyle='#232d28';c.fillRect(0,0,1080,14);
 c.fillStyle='#29332f';c.font='54px serif';c.fillText('人生之书',84,110);
 c.font='24px sans-serif';c.fillStyle='#737a72';c.fillText('旅 途 战 报 · JOURNEY REPORT',84,158);
 if(stats.rating){c.font='500 84px serif';c.fillStyle='#a3803e';c.textAlign='right';c.fillText(stats.rating,996,140);c.font='20px sans-serif';c.fillText('战力评级',996,172);c.textAlign='left';}
 c.strokeStyle='#c5c9bf';c.beginPath();c.moveTo(84,196);c.lineTo(996,196);c.stroke();
 let y=258;c.font='40px serif';c.fillStyle='#29332f';
 String(verdict.join('')).split('。').forEach(part=>{if(!part)return;lines(c,part+'。',912).forEach(line=>{c.fillText(line,84,y);y+=56;});});
 y+=18;
 const fm=function(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',');};
 const fday=function(min){if(min>=60){const h=Math.floor(min/60),m=min%60;return m?h+' 小时 '+m+' 分钟':h+' 小时';}return min+' 分钟';};
 const band=[];
 if(stats.moneyMonth)band.push(['币','每月 +¥'+fm(stats.moneyMonth)]);
 if(stats.timeDay)band.push(['时','每天 +'+fday(stats.timeDay)]);
 if(stats.youngYears)band.push(['龄','身体 −'+stats.youngYears+' 岁']);
 if(stats.freeDays)band.push(['闲','每月 +'+stats.freeDays+' 个傍晚']);
 if(stats.pits&&stats.pits.length)band.push(['盾','避开 '+stats.pits.length+' 个坑']);
 if(band.length){const bh=64;let bx=84;band.forEach(b=>{c.font='26px sans-serif';const w=c.measureText(b[1]).width+88;if(bx+w>996){bx=84;y+=bh+14;}
  c.fillStyle='#29332f';if(c.roundRect){c.beginPath();c.roundRect(bx,y,w,bh,10);c.fill();}else c.fillRect(bx,y,w,bh);
  c.fillStyle='#e8d9a8';c.font='26px serif';c.fillText(b[0],bx+24,y+42);
  c.fillStyle='#f4f1e9';c.font='26px sans-serif';c.fillText(b[1],bx+62,y+42);bx+=w+16;});y+=bh+34;}
 if(stats.pits.length){c.fillStyle='#a4635a';c.font='30px sans-serif';c.fillText('照做能避开的坑 · '+stats.pits.length,84,y);y+=22;
  c.fillStyle='#343d3a';c.font='27px sans-serif';stats.pits.slice(0,5).forEach(t=>{lines(c,'· '+t,900).forEach(line=>{y+=44;c.fillText(line,84,y);});});
  if(stats.pits.length>5){y+=44;c.fillStyle='#737a72';c.fillText('· ……以及另外 '+(stats.pits.length-5)+' 个',84,y);}y+=26;}
 const parts=[];['金钱','时间','自由','死亡率'].forEach(k=>{if(stats.gains[k])parts.push((k==='死亡率'?'健康':k)+' × '+stats.gains[k]);});
 const GAIN_META=[['money','金钱','#a3803e'],['time','时间','#5b7183'],['freedom','自由','#71835c'],['health','健康','#a4635a']];
 c.fillStyle='#435d4c';c.font='30px sans-serif';
 c.fillText(stats.total?'卡组构成 · 战力值 '+stats.total+(stats.rating?' · '+stats.rating+' 级':''):'能拿到的收益',84,y);y+=26;
 GAIN_META.forEach(g=>{const p=stats.points[g[0]];if(!p)return;
  y+=40;c.fillStyle='#343d3a';c.font='26px sans-serif';c.fillText(g[1],84,y);
  const bw=Math.max(30,Math.round(p/stats.total*560));c.fillStyle='#e2e4d6';c.fillRect(240,y-22,560,26);c.fillStyle=g[2];c.fillRect(240,y-22,bw,26);
  c.fillStyle='#29332f';c.font='500 26px sans-serif';c.fillText(p+' 点',820,y);});
 if(!stats.total){y+=40;c.fillStyle='#343d3a';c.font='26px sans-serif';c.fillText('十张行动牌，收益以原文标注为准。',84,y);}
 y+=40;
 c.fillStyle='#8c7a4a';c.font='30px sans-serif';c.fillText('这副牌里收下的行动',84,y);y+=22;
 c.fillStyle='#343d3a';c.font='27px sans-serif';
 const shown=y>1080?3:6;
 cards.slice(0,shown).forEach((card,i)=>{lines(c,(i+1<10?'0':'')+(i+1)+'  '+card.title,900).forEach(line=>{y+=44;c.fillText(line,84,y);});});
 if(cards.length>shown){y+=44;c.fillStyle='#737a72';c.fillText('……以及另外 '+(cards.length-shown)+' 张',84,y);}
 y+=30;
 if(aspectList.length&&y+96<1330){c.fillStyle='#737a72';c.font='24px sans-serif';c.fillText('这段旅途走过的领域',84,y);y+=28;
  let x=84;const chipH=64;aspectList.forEach(a=>{const label=a.icon+' '+a.title+' ×'+a.n;c.font='26px sans-serif';const w=c.measureText(label).width+56;if(x+w>996){x=84;y+=chipH+16;}
   c.fillStyle='#f8f5eb';c.strokeStyle=a.accent;c.lineWidth=2;
   if(c.roundRect){c.beginPath();c.roundRect(x,y,w,chipH,10);c.fill();c.stroke();}else{c.fillRect(x,y,w,chipH);c.strokeRect(x,y,w,chipH);}
   c.fillStyle=a.accent;c.fillText(label,x+28,y+42);x+=w+18;});y+=chipH;}
 const fy=Math.min(Math.max(y+44,1330),1360);
 c.fillStyle='#737a72';c.font='22px sans-serif';
 c.fillText('金额、时间与"年轻"为原文等级的游戏化折算，帮你感受方向，不是精算承诺',84,fy);
 c.fillText('原文来自 HowToLiveBetter；数据只存在本机',84,fy+36);
 if(fy+74<=1430){c.fillStyle='#a3803e';c.font='24px serif';c.fillText('路还长，但你手里已经有一副好牌',84,fy+74);}
 return canvas.toDataURL('image/png');
}
function saveImage(url){if(!/^data:image\/png;base64,/.test(url))return Promise.reject(Error('图片还未生成'));const api=root.xhs&&root.xhs.miniTool;if(!api||typeof api.saveImageToPhotosAlbum!=='function')return Promise.resolve({saved:false,preview:true});return new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('暂未收到相册结果，请先检查相册再决定是否重试。')),20000);try{Promise.resolve(api.saveImageToPhotosAlbum({filePath:url})).then(r=>{clearTimeout(t);if(r&&r.errMsg&&r.errMsg.indexOf(':fail')>=0){reject(Error('相册保存失败，请检查权限。'));return;}resolve({saved:true});},e=>{clearTimeout(t);reject(Error(e&&e.errMsg?e.errMsg:'相册保存失败，请检查权限后重试。'));});}catch(e){clearTimeout(t);reject(Error('相册保存失败，请检查权限后重试。'));}});}
root.LifePlatform={KEY:KEY,load:load,save:save,poster:poster,journeyPoster:journeyPoster,readingPages:readingPages,readingPage:readingPage,saveImage:saveImage};
})(typeof window!=='undefined'?window:globalThis);
