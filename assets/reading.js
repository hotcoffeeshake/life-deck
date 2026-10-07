(function(root){
'use strict';
// Each reference is [chapter id, one-based level-three heading index].
// These are editorial mappings, not claims that the product's action steps are verbatim quotations.
const entries={
 'subscription-audit':['每个月自动扣走的钱里，哪些服务你已经很少用了？',[[5,1]],'background'],
 'subscription-stop':['确认不用的订阅，怎样才能停止下一次扣款？',[[5,1]],'related'],
 'subscription-calendar':['还拿不准要不要续费，怎样给自己留一次重新选择的机会？',[[5,1]],'background'],
 'phone-usage':['流量和通话总用不完，现在的套餐是不是买多了？',[[5,4]],'related'],
 'phone-plan':['换一个手机或宽带套餐，算上合约费用还划算吗？',[[5,4]],'related'],
 'phone-bundle':['宽带、手机和会员里，有没有为同一种服务付了两次钱？',[[5,4]],'background'],
 'shopping-pause':['一件很想买但不急用的东西，怎样判断自己是不是真的需要？',[[5,23]],'related'],
 'shopping-total':['优惠看起来很大，买回家之后的总开支真的更低吗？',[[5,24]],'background'],
 'shopping-prepay':['商家让你先充一大笔钱，付款前有哪些约定要看清？',[[5,21],[5,22]],'related'],
 'interrupt-notify':['手机总把注意力拉走，哪些通知可以先安静下来？',[[3,1]],'related'],
 'interrupt-batch':['总是边做事边回消息，怎样安排回复才不会反复被打断？',[[3,5]],'related'],
 'interrupt-focus':['刚进入状态就被打断，怎样留下一段能连续思考的时间？',[[3,6],[3,7]],'related'],
 'starting-tiny':['事情一多就迟迟开始不了，第一步到底可以小到什么程度？',[[4,7],[4,9]],'background'],
 'starting-when':['总说有空再做，怎样把一个想法变成会发生的行动？',[[4,1],[4,10]],'related'],
 'starting-past':['明明安排好了时间，为什么事情总比预计做得更久？',[[4,4]],'related'],
 'commute-log':['每天花在通勤上的时间，究竟耗在路上还是等车和换乘？',[[4,18]],'background'],
 'commute-compare':['如果换一条真正可行的路线，每个月能腾出多少时间？',[[4,18]],'background'],
 'commute-batch':['生活里反复跑的几趟路，有没有哪一件可以合在一起办？',[],'original'],
 'rest-log':['最近总觉得没精神，先记录哪些作息信息才有帮助？',[[2,13],[3,2]],'background'],
 'rest-evening':['明明想早点休息，怎样减少睡前停不下来的刷屏？',[[3,8],[3,9]],'related'],
 'rest-support':['精力不足已经影响生活，求助时怎样把自己的困扰说清楚？',[],'original'],
 'habits-observe':['想调整饮食或活动习惯，却不知道从哪里开始，怎么选第一步？',[],'original'],
 'habits-move':['没有大块时间运动，日常生活里还能在哪里动一动？',[[2,16],[2,18]],'related'],
 'habits-check':['面对保健品和健康宣传，购买前该先核对哪些事情？',[[6,10],[6,13]],'background'],
 'care-folder':['看病时病历和检查总找不齐，平时该怎样保存自己的医疗资料？',[[24,6]],'related'],
 'care-questions':['就诊时间有限，怎样提前准备才能把最关心的问题问清楚？',[],'original'],
 'care-followup':['复查和用药安排容易忘，怎样按实际医嘱整理下一步？',[[16,1],[16,3]],'related'],
 'rent-contract':['租房合同里的押金、维修和解约，哪些约定需要先写清楚？',[[15,1],[15,6]],'related'],
 'rent-cost':['一套房子看着租金合适，住进去总共需要准备多少钱？',[[4,18],[15,1]],'background'],
 'rent-record':['交房时发现设施有问题，怎样留下双方都能核对的记录？',[[15,6]],'background'],
 'moving-list':['搬家时事情很多，怎样把退租、交接和服务变更排明白？',[],'original'],
 'moving-safety':['第一次住进新地方，有哪些安全设施和求助方式要先熟悉？',[[1,3],[1,4],[1,6]],'background'],
 'moving-contact':['独居时如果需要别人帮忙，哪些联络信息应该提前放好？',[[29,6]],'background'],
 'employment-file':['准备离职或核对工作权益时，哪些属于自己的材料应该先留好？',[[19,8],[11,7]],'related'],
 'employment-check':['入职或离职有许多文件要签，哪些结算和交接事项需要先确认？',[[19,7],[19,9]],'background'],
 'employment-gap':['离职后收入和保障可能变化，怎样先安排过渡期的基本生活？',[[7,1],[7,18],[5,27]],'background'],
 'child-plan':['从怀孕到孩子上学，每个阶段的待办怎样才能少漏一件？',[],'original'],
 'child-share':['孩子需要照顾的那些时段，怎样把每个人能承担的部分谈清楚？',[[18,4]],'related'],
 'child-record':['给孩子办证、就医或入学时，怎样准备资料才不总是来回找？',[],'original'],
 'elder-info':['长辈突然需要帮助时，家人能找到必要的联系和就医信息吗？',[[24,6],[29,6]],'background'],
 'elder-money':['长辈面对大额付款或投资邀请，怎样多留一道核实的机会？',[[17,3],[17,4],[17,5]],'related'],
 'elder-wishes':['将来的照护和重要安排，怎样趁彼此愿意谈时先把意愿说清？',[[17,1],[17,2]],'related'],
 'support-needs':['家人经历病痛或重大变化时，我怎样确认自己的帮助是对方需要的？',[],'original'],
 'support-team':['照护快变成一个人的事时，还可以找谁一起分担？',[[33,4],[29,6]],'background'],
 'support-paper':['家人需要长期支持，怎样逐项核实可以申请的服务和帮助？',[[33,7],[17,7]],'related'],
 'account-recovery':['如果手机丢了或账号登不上，现有的恢复方式还能用吗？',[[14,4]],'background'],
 'account-verify':['重要账号只靠一个密码，怎样再加一道验证？',[[14,1]],'related'],
 'account-sessions':['以前登录过的设备和授权过的应用，现在还有哪些能访问账号？',[[14,6]],'related'],
 'rights-write':['借钱、付款或签合同之前，哪些重要约定应该落在文字里？',[[8,17],[8,18]],'related'],
 'rights-record':['一笔重要交易出了争议，需要的合同和凭证还能找得到吗？',[[8,22]],'background'],
 'rights-pause':['对方一直催着签字，怎样确认自己真的理解了要承担的事？',[[8,17]],'related'],
 'emergency-exit':['在常去的场所里，你知道安全出口在哪里、通道是否畅通吗？',[[22,1]],'related'],
 'emergency-contacts':['需要紧急求助时，怎样让地址、联系人和正式渠道更容易找到？',[[29,6]],'background'],
 'emergency-learn':['想学会应对紧急情况，怎样找到能带着自己实际练习的正规课程？',[],'original'],
 'firstpath-map':['十八岁之后，除了眼前这一条路，还有哪些选择可以认真比较？',[[31,1],[31,10]],'related'],
 'firstpath-cost':['继续读书、就业或学技能，各条路的费用和时间该怎样分别算？',[[23,4],[23,6],[31,1]],'background'],
 'firstpath-try':['对一个方向感兴趣却不了解真实日常，怎样先做一次小体验？',[],'original'],
 'careerchange-keep':['想换工作的原因，究竟是现在的岗位、公司，还是整个职业方向？',[],'original'],
 'careerchange-evidence':['想象中的新职业，和真实岗位要求之间还有多远？',[[23,12]],'related'],
 'careerchange-trial':['还没确定要不要转行，怎样先做一个可以回头的小尝试？',[[4,2],[11,13]],'background'],
 'restart-inventory':['重新求职时，怎样把做过的事情整理成别人看得懂的能力证据？',[[7,14]],'background'],
 'restart-search':['投了很多简历却不知道怎么调整，怎样让求职反馈更有方向？',[[7,5],[7,14]],'related'],
 'restart-buffer':['收入暂时不稳定时，怎样安排求职、学习和基本生活的投入？',[[7,1],[7,13],[5,27]],'background'],
 'partner-needs':['在一段关系里，怎样把自己真正看重的相处方式说清楚？',[[10,4],[10,5]],'background'],
 'partner-boundary':['有些事情不想答应，怎样表达自己的边界并尊重双方意愿？',[[10,2],[3,16]],'background'],
 'partner-review':['想知道这段关系适不适合自己，应该回看哪些持续发生的事实？',[[10,3],[10,4],[10,15]],'related'],
 'marriage-talk':['准备一起生活之前，居住、工作和家务该怎样提前谈一谈？',[[10,9]],'related'],
 'marriage-money':['共同生活的钱怎样承担，哪些财务约定需要先说明白？',[[10,10],[10,12]],'related'],
 'marriage-check':['准备结婚时，还有哪些手续、健康信息和家庭安排没有核实？',[[10,13],[10,14]],'background'],
 'parenthood-wish':['关于要不要孩子，哪些是自己的意愿，哪些来自别人的期待？',[[18,6]],'related'],
 'parenthood-resources':['如果进入育儿阶段，实际的时间、资金和照护资源够不够？',[[18,4],[18,5]],'related'],
 'parenthood-questions':['考虑生育却还有很多疑问，怎样找到适合自己情况的可靠信息？',[],'original'],
 'city-budget':['想搬去另一座城市，搬迁和开始生活需要准备多少资源？',[[4,18],[15,1]],'background'],
 'city-check':['一个城市看起来机会很多，怎样确认其中哪些是自己能进入的？',[[23,12]],'background'],
 'city-visit':['喜欢一座城市的旅行体验，怎样再看看在那里过普通日子是什么样？',[],'original'],
 'abroad-identity':['准备留学或出国之前，学校、签证和身份资格该从哪里核实？',[[32,1],[32,4],[21,9]],'related'],
 'abroad-budget':['除了学费和机票，在海外生活还需要把哪些费用算进去？',[[21,4],[32,7],[32,8]],'background'],
 'abroad-backup':['人在境外时证件丢失或行程变化，提前准备什么会更容易求助？',[[21,1],[21,2],[21,7],[21,11]],'related'],
 'business-demand':['准备做副业或创业，怎样确认真的有人需要你提供的东西？',[[12,18]],'related'],
 'business-limit':['一个想法越做越投入，怎样提前划好自己能承担的上限？',[[12,1],[4,2],[4,3]],'related'],
 'business-rules':['准备开始经营前，怎样核对自己的业务需要哪些登记、许可和申报？',[[12,6],[12,7],[12,12]],'related']
};
const chapterCache={};
function item(card){return card&&entries[card.id]||null;}
function chapterSections(id){
 const source=root.LifeSources;
 if(!source||!Array.isArray(source.chapters))return [];
 const chapter=source.chapters.find(function(c){return c.id===id;});
 if(!chapter)return [];
 if(chapterCache[id]&&chapterCache[id].source===chapter.text)return chapterCache[id].sections;
 const found=[];const pattern=/^### ([^\r\n]+)\r?$/gm;let match;
 while((match=pattern.exec(chapter.text))!==null)found.push({start:match.index,heading:match[1]});
 const sections=found.map(function(h,i){return {chapterId:chapter.id,chapterTitle:chapter.title,heading:h.heading,text:chapter.text.slice(h.start,i+1<found.length?found[i+1].start:chapter.text.length),url:chapter.url};});
 chapterCache[id]={source:chapter.text,sections:sections};return sections;
}
function sections(card){
 const original=root.LifeCatalog&&root.LifeCatalog.get(card.id);if(original)return [{chapterId:original.chapterId,chapterTitle:original.chapterTitle,heading:original.heading,text:original.text,url:original.url}];
 const entry=item(card);if(!entry)return [];
 return entry[1].map(function(ref){const section=chapterSections(ref[0])[ref[1]-1];return section?Object.assign({},section):null;}).filter(Boolean);
}
function question(card){const original=root.LifeCatalog&&root.LifeCatalog.get(card.id);if(original)return original.question;const entry=item(card);return entry?entry[0]:'这条建议适合我现在的情况吗？';}
function note(card){
 if(root.LifeCatalog&&root.LifeCatalog.get(card.id))return "下面是原文整条建议，来源和备注也保留在内。";
 const entry=item(card);
 if(!entry||entry[2]==='original')return '产品整理延伸：这是一条本工具整理的行动建议，尚未找到直接对应的仓库原文条目；不将它标作原作者建议。';
 if(entry[2]==='background')return '产品整理延伸：问题和行动步骤由本工具整理。以下仅作为背景参考，保留相关原文完整内容；原作者并未逐字提出上面的行动方法。';
 return '原文相关建议：问题和行动步骤由本工具整理，并非原文逐字引用。以下逐条保留对应原文的完整内容，包括来源与备注；展示原文不等于已核验其中的主张。';
}
function chapterIds(card){return Array.from(new Set((card.chapters||[]).concat(sections(card).map(s=>s.chapterId))));}
function sourceLabel(card){const original=root.LifeCatalog&&root.LifeCatalog.get(card.id);if(original)return '《高性价比人生指南》第 '+original.chapterId+' 章 · '+original.heading+'。';const mapped=Array.from(new Set(sections(card).map(s=>s.chapterId)));return (mapped.length?'本页原文来自第 '+mapped.join('、')+' 章。':'本卡没有直接对应的原文条目。')+((card.chapters||[]).length?' 场景背景资料：第 '+card.chapters.join('、')+' 章。':'')+' 行动步骤为产品整理。';}
function displayText(text,omitHeading){
 let firstHeading=true;
 return text.split('\n').filter(line=>{
  if(/^\s*<!--.*-->\s*$/.test(line))return false;
  if(/^### /.test(line)&&firstHeading){firstHeading=false;if(omitHeading)return false;}
  return true;
 }).map(line=>line.replace(/^- 说人话[：:]\s*/, '')).join('\n');
}
root.LifeReading={question:question,sections:sections,note:note,chapterIds:chapterIds,sourceLabel:sourceLabel,displayText:displayText};
})(typeof window!=='undefined'?window:globalThis);
