(function (root) {
  'use strict';
  // 产品编辑标签：用于探索路由和排序，不是原作者分类，也不推断用户身份或健康状况。
  var stages = ['student','jobseeker','earlywork','working','changing','family','retired'];
  var aspects = [
    {id:'money',title:'钱与消费',icon:'钱',accent:'#a3803e',subtopics:[['fixed_spending','固定开支'],['consumption','购买与消费'],['savings_investing','储蓄、投资与保险'],['benefits_support','补贴与生活救助']]},
    {id:'work',title:'工作与学习',icon:'业',accent:'#5b7183',subtopics:[['job_search','找工作'],['labor_rights','在职、离职与工伤'],['business','经营与创业'],['skills','技能与培训'],['study_methods','学习方法']]},
    {id:'daily',title:'时间与日常',icon:'时',accent:'#71835c',subtopics:[['focus','专注与信息安排'],['habits','计划、拖延与习惯'],['rest','作息与精力']]},
    {id:'health',title:'身体与就医',icon:'身',accent:'#a4635a',subtopics:[['prevention','疫苗与筛查'],['lifestyle','饮食、运动与烟酒'],['care','就医与医疗消费'],['chronic','慢性病管理'],['appearance','外形与身体'],['disability','残疾与康复'],['mental_health','心理困扰与重大打击']]},
    {id:'home',title:'住房与家人',icon:'家',accent:'#7d6f8e',subtopics:[['housing','租房与买房'],['eldercare','照护老人'],['parenting','养育与孩子上学'],['pregnancy','怀孕与生产'],['family_admin','家人离世后的事务']]},
    {id:'relations',title:'相处与关系',icon:'缘',accent:'#b07a8c',subtopics:[['dating','认识与交往'],['partnership','婚姻与共同生活'],['social','相处、边界与支持']]},
    {id:'safety',title:'安全与权益',icon:'盾',accent:'#52706a',subtopics:[['accidents','出行与日常防护'],['first_aid','紧急情况与急救'],['law_fraud','法律、诈骗与维权'],['digital','账号与个人信息'],['professional_law','技术与平台责任']]},
    {id:'choices',title:'人生选择',icon:'择',accent:'#8c7a4a',subtopics:[['adulthood','成年后的道路'],['abroad','出国、留学与境外生活'],['decisions','重大决定与取舍']]}
  ];
  var subAspect = {}, subTitles = {};
  aspects.forEach(function (aspect) { aspect.subtopics=aspect.subtopics.map(function (pair) {subAspect[pair[0]]=aspect.id;subTitles[pair[0]]=pair[1];return {id:pair[0],title:pair[1]};}); });
  // 原文章节作为默认主题；下面逐章条目表处理跨方面内容，避免正文偶然出现的词改变分类。
  var defaults={1:'prevention',2:'lifestyle',3:'rest',4:'habits',5:'consumption',6:'care',7:'benefits_support',8:'law_fraud',9:'law_fraud',10:'partnership',11:'professional_law',12:'business',13:'first_aid',14:'digital',15:'housing',16:'chronic',17:'eldercare',18:'parenting',19:'labor_rights',20:'parenting',21:'abroad',22:'rest',23:'skills',24:'care',25:'family_admin',26:'professional_law',27:'pregnancy',28:'appearance',29:'mental_health',30:'parenting',31:'adulthood',32:'abroad',33:'disability'};
  var exceptions={};
  function assign(chapter,subtopic,numbers) {numbers.split(',').forEach(function (n) {exceptions['source-'+chapter+'-'+n]=subtopic;});}
  assign(1,'accidents','1,2,3,4,5,6,9,10,11,12,26,36');
  assign(1,'chronic','7,29');assign(1,'lifestyle','13');assign(1,'first_aid','15,33,34');assign(1,'mental_health','25,32');assign(1,'care','27,28,30,31');assign(1,'law_fraud','35');
  assign(2,'care','10');assign(2,'chronic','12');assign(2,'rest','13,38,39');assign(2,'accidents','30');assign(2,'labor_rights','40');
  assign(3,'focus','1,5,6,7,12,17,21');assign(3,'mental_health','14,15,19,22,23,25');assign(3,'social','16,18,24');assign(3,'law_fraud','20');assign(3,'labor_rights','13');assign(3,'decisions','10');
  assign(4,'decisions','2,3');assign(4,'focus','5,6,15,16,17');assign(4,'housing','18');
  assign(5,'fixed_spending','1,4,14');assign(5,'benefits_support','2,20');assign(5,'housing','3,28');assign(5,'savings_investing','5,7,15,16,17,18,19,25,26,27,37,38');assign(5,'law_fraud','6,9,10,22,29,30,31');assign(5,'care','12,13');
  assign(6,'consumption','9,22,23,24');assign(6,'decisions','15');assign(6,'habits','25');assign(6,'lifestyle','8,12,14,26');assign(6,'prevention','7,18');assign(6,'chronic','19,20,21');
  assign(7,'labor_rights','1,2,12,18');assign(7,'law_fraud','3,11,15,19');assign(7,'job_search','5,14');assign(7,'skills','13');assign(7,'care','9,10');assign(7,'housing','16,17');assign(7,'savings_investing','20');assign(7,'disability','8');
  assign(8,'accidents','1,7,29,30');assign(8,'mental_health','14,15');assign(8,'digital','16');assign(8,'housing','27');
  assign(10,'dating','1,2,3,4,5,6');assign(10,'social','15,18');
  assign(12,'law_fraud','14,20,21');assign(12,'labor_rights','16,17,22');
  assign(13,'accidents','27,28,30,31,32,33,34,35,36,37');assign(13,'law_fraud','39');
  assign(21,'law_fraud','5,10');assign(21,'digital','7');
  assign(22,'accidents','1,4,6');assign(22,'law_fraud','2,3,5');assign(22,'mental_health','7,8,9');assign(22,'social','10');
  assign(23,'law_fraud','1');assign(23,'adulthood','2,3,4,5,6,7');assign(23,'job_search','9,10,11,12,13');assign(23,'study_methods','14,15,16,17,18,19');
  assign(24,'law_fraud','7');assign(24,'first_aid','8,9');assign(24,'disability','10,11');
  assign(26,'business','11');assign(29,'labor_rights','3');assign(29,'social','6');assign(29,'parenting','7');assign(29,'decisions','12');
  // 人生道路与留学章整体保留在“人生选择”；不因标题含“保险/工资”丢失选择背景。
  var audienceDefaults={11:['earlywork','working','changing'],12:['earlywork','working','changing'],17:['family','retired'],18:['family'],19:['earlywork','working','changing'],20:['family'],25:['family'],26:['earlywork','working','changing'],27:['family'],30:['family'],31:['student','earlywork','changing'],32:['student','changing']};
  var conditionDefaults={11:'从事程序开发或技术工作',12:'经营生意或准备创业',16:'已确诊慢性病',17:'家中有老人需要照护',18:'考虑养育孩子',19:'处于劳动关系或离职、工伤处理中',20:'照顾婴幼儿',21:'准备出境或正在境外',25:'办理家人离世后的事务',26:'运营网站、App 或平台',27:'备孕、怀孕或产后',28:'考虑改变外形或体重',29:'遭遇重大生活打击',30:'照顾学龄孩子',31:'考虑成年后的升学或就业道路',32:'考虑留学或已在境外就读',33:'本人或家人存在残疾、康复需求'};
  function audience(card) {
    var list=audienceDefaults[card.chapterId] ? audienceDefaults[card.chapterId].slice() : stages.slice();
    var conditions=conditionDefaults[card.chapterId] ? [conditionDefaults[card.chapterId]] : [];
    var title=card.title;
    function condition(pattern,label) {if(pattern.test(title)&&conditions.indexOf(label)<0)conditions.push(label);}
    condition(/女性|宫颈|乳腺/,'原文明确涉及女性健康');
    condition(/60 岁|65 岁|老年|老人/,'原文涉及老年人');
    condition(/35 岁|40 岁|45 到 50 岁|50 岁|30 岁以上/,'按原文年龄门槛判断适用性');
    condition(/孩子|儿童|婴儿|新生儿/,'照顾未成年孩子');
    condition(/高血压|糖尿病|心血管病|痛风|肾结石|血尿酸|胆囊结石/,'原文有特定疾病、指标或既往史条件');
    condition(/吸烟|抽烟|戒烟|电子烟/,'原文涉及吸烟或烟草暴露');
    condition(/喝酒|戒酒|酒驾|每天都喝酒/,'原文涉及饮酒');
    condition(/残疾|脊髓损伤|轮椅|瘫痪|失明|耳聋/,'原文涉及残疾、功能障碍或康复');
    condition(/怀孕|孕期|孕妇|产后|分娩/,'原文涉及备孕、孕产期');
    condition(/房贷|买房|产权证|抵押情况/,'购房或持有住房贷款');
    condition(/股票|基金|投资|理财/,'考虑投资或持有相关资产');
    condition(/开车|自驾|驾照|方向盘|三者险/,'驾驶或有车辆保险需求');
    condition(/领证|配偶|婚内|婚前|婚姻|离婚|彩礼/,'考虑婚姻或处于婚姻关系');
    if(!audienceDefaults[card.chapterId]) {
      if(/孩子|儿童|婴儿|新生儿|孕妇|怀孕/.test(title))list=['family'];
      else if(/老人|老年|60 岁|65 岁/.test(title))list=['family','retired'];
      else if(/失业|被裁|离职|辞退/.test(title))list=['earlywork','working','changing'];
      else if(/租房|房租|合租/.test(title))list=['student','earlywork','working','changing','family'];
    }
    // common 表示没有明确人群或特定情境门槛，仍不等于任何人都必须照做。
    return {audiences:list,conditions:conditions,common:list.length===stages.length && conditions.length===0};
  }
  function labels(text) {
    var comment=/<!--\s*成本标签[：:]\s*([^]*?)\s*-->/.exec(text || '');
    var values={};
    if(comment)comment[1].replace(/(钱|时间|毅力|收益|口径)=([^\s]+)/g,function (_,key,value) {values[key]=value;return _;});
    return {cost:{money:values['钱']||null,time:values['时间']||null,effort:values['毅力']||null},benefit:{level:values['收益']||null,metric:values['口径']||null}};
  }
  var rows={}, byAspect={}, bySubtopic={};
  aspects.forEach(function (a) {byAspect[a.id]=[];a.subtopics.forEach(function (s) {bySubtopic[s.id]=[];});});
  root.LifeCatalog.all.forEach(function (card) {
    var subtopic=exceptions[card.id] || defaults[card.chapterId];
    var aud=audience(card),metadata=labels(card.text);
    rows[card.id]={aspect:subAspect[subtopic],subtopic:subtopic,audiences:aud.audiences,common:aud.common,conditions:aud.conditions,cost:metadata.cost,benefit:metadata.benefit,classificationBasis:exceptions[card.id] ? '产品编辑：逐条标题与章节上下文确认 → '+subTitles[subtopic] : '产品编辑：第 '+card.chapterId+' 章主题 → '+subTitles[subtopic]};
    // 求职类条目只调整排序受众，不改变适用前提；是否推荐仍由 LifeApplicability 决定。
    if(subtopic==='job_search') {rows[card.id].audiences=['jobseeker','student','earlywork','working','changing'];rows[card.id].common=false;}
    // 第 6 章为产品 UI 的“反面清单”标签，仅作展示用途，不改变原文与成本收益值。
    if(card.chapterId===6)rows[card.id].discouragement=true;
    byAspect[subAspect[subtopic]].push(card);bySubtopic[subtopic].push(card);
  });
  function get(input) {return rows[typeof input==='string'?input:input&&input.id] || null;}
  function aspectInfo(id) {var found=null;aspects.forEach(function (a) {if(a.id===id)found=a;});return found ? {id:found.id,title:found.title,icon:found.icon,accent:found.accent} : null;}
  function subTitle(id) {return subTitles[id] || '';}
  function cards(aspect,subtopic) {if(subtopic)return subAspect[subtopic]===aspect ? bySubtopic[subtopic].slice() : [];return byAspect[aspect] ? byAspect[aspect].slice() : [];}
  function audienceScore(input,profile) {var row=get(input);if(!row||stages.indexOf(profile)<0)return 0;return row.audiences.indexOf(profile)>=0 ? (row.common?1:3) : 0;}
  function followups(input) {
    var row=get(input);if(!row)return [];
    var aspect=aspects.filter(function (a) {return a.id===row.aspect;})[0];
    var ordered=aspect.subtopics.slice().sort(function (a,b) {return (b.id===row.subtopic?1:0)-(a.id===row.subtopic?1:0);});
    var inputId=typeof input==='string'?input:input.id;
    return ordered.map(function (s) {return {aspect:row.aspect,subtopic:s.id,ids:bySubtopic[s.id].filter(function (c) {return c.id!==inputId;}).map(function (c) {return c.id;})};});
  }
  root.LifeRoutes={aspects:aspects,get:get,aspectInfo:aspectInfo,subTitle:subTitle,cards:cards,audienceScore:audienceScore,followups:followups};
}(window));
