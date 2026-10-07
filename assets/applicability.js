(function (root) {
  'use strict';
  // 产品编辑的适用前提，独立于兴趣与原文。用户点击建议不能据此确认事实。
  var contexts = [
    ['job_search','正在找工作'],['employed','目前在职'],['unemployed','目前没有工作'],
    ['labor_dispute','正在处理劳动纠纷'],['work_injury','本人或家人正在处理工伤'],
    ['business','经营生意或准备创业'],['site_operator','运营或准备上线网站、App、平台'],['technical_work','从事开发或技术工作'],
    ['housing_rent','租房或准备租房'],['housing_buy','买房或有住房贷款'],
    ['parenting','养育孩子或认真考虑生育'],['pregnancy','备孕、怀孕或产后'],['infant_care','照顾婴幼儿'],['student_care','照顾学龄孩子'],
    ['eldercare','照护老人'],['bereavement','办理丧事或经历丧亲'],
    ['abroad','准备出境或在境外生活'],['study_abroad','准备留学或正在留学'],
    ['chronic_care','管理已确诊慢性病'],['specific_health','有原文涉及的症状、年龄或医疗需求'],
    ['disability_care','本人或家人有残疾、康复需求'],['mental_crisis','正在经历严重心理困扰'],
    ['investing','正在投资或准备投资'],['debt','有借款、债务或还款问题'],['taxpayer','正在缴纳个人所得税'],
    ['driving','驾驶车辆'],['smoking','吸烟或正在戒烟'],['alcohol','经常饮酒或正在戒酒'],
    ['marriage','正在考虑或处理婚恋、婚姻事务'],['financial_hardship','有生活救助需求'],['legal_case','正在处理纠纷、诉讼或处罚'],
    ['pet_owner','养宠物'],['education_transition','正在考虑升学、参军或成年后的道路'],['veteran','已经退役'],
    ['age60plus','本人已满 60 岁'],['limited_support','缺少可以联系的亲友或支持'],['freelance','从事灵活就业'],['appearance_care','考虑减重或医美'],['outdoor','准备野外活动或高原出行']
  ].map(function (pair) {return {id:pair[0],title:pair[1]};});
  var labels={}; contexts.forEach(function (c) {labels[c.id]=c.title;});
  var defaults={1:[],2:[],3:[],4:[],5:[],6:[],7:['financial_hardship'],8:[],9:[],10:['marriage'],11:['technical_work'],12:['business'],13:[],14:[],15:['housing_rent'],16:['chronic_care'],17:['eldercare'],18:['parenting'],19:['employed'],20:['infant_care'],21:['abroad'],22:[],23:[],24:[],25:['bereavement'],26:['site_operator'],27:['pregnancy'],28:['appearance_care'],29:['mental_crisis'],30:['student_care'],31:['education_transition'],32:['study_abroad'],33:['disability_care']};
  var overrides={};
  function set(chapter, numbers, requires) { numbers.split(',').forEach(function (n) {overrides['source-'+chapter+'-'+n]=requires;}); }
  set(1,'7,29',['chronic_care','specific_health']);
  set(1,'8,16,17,18,19,20,21,22,23,24,27,28,31',['specific_health']);
  set(1,'9',['driving']);set(1,'10,11,12',['parenting']);set(1,'13',['age60plus']);set(1,'25,32,33,34',['mental_crisis']);
  set(2,'1,2,3,4,5,6',['smoking']);set(2,'12',['chronic_care','specific_health']);set(2,'21,22',['alcohol']);set(2,'40',['employed']);
  set(3,'7,12,13',['employed']);set(3,'15,19,23',['mental_crisis']);
  set(4,'5,6',['employed']);set(4,'18',['housing_rent']);
  set(5,'2,20',['taxpayer']);set(5,'3',['housing_rent']);set(5,'9,10',['parenting']);set(5,'13',['employed']);
  set(5,'15,16,17,18,19,37,38',['investing']);set(5,'26',['driving']);set(5,'28',['housing_buy','debt']);
  set(6,'5,19,20,21',['specific_health']);
  set(7,'1,12,13,18',['unemployed']);set(7,'2',['labor_dispute']);set(7,'3,19',['legal_case']);set(7,'5,14,15',['job_search']);set(7,'8',['disability_care']);set(7,'10',['specific_health']);set(7,'11,20',[]);set(7,'16,17',['housing_rent','financial_hardship']);
  set(8,'36,37,39,43',['legal_case']);set(8,'38',['mental_crisis']);
  set(8,'1,7',['driving']);set(8,'2,5,6,12,19,20,21,22,33,34,35',['legal_case']);
  set(8,'14,15',['mental_crisis']);set(8,'18',['debt']);set(8,'23,24,25,26,32',['marriage']);set(8,'29',['abroad']);set(8,'30',['pet_owner']);
  set(9,'11',['outdoor']);set(9,'15',['debt']);set(9,'17',['legal_case']);set(9,'20',['parenting']);
  set(10,'2,15,18',[]);set(10,'11',['marriage','housing_buy']);
  set(11,'6,7,13',['technical_work','employed']);set(11,'12',['labor_dispute']);set(11,'15,16,17',['site_operator']);
  set(12,'22',['employed']);
  set(13,'10',['eldercare']);set(13,'17',['chronic_care','specific_health']);set(13,'27,28,29,31,32,33,34,35,36',['outdoor']);set(13,'38',['specific_health']);set(13,'39',['legal_case']);
  set(14,'4,5',[]);
  set(15,'6,7',['housing_buy']);
  set(16,'7,8,9',['chronic_care','specific_health']);
  set(17,'7,8',['eldercare','disability_care']);
  set(18,'2,3',['pregnancy','employed']);
  set(19,'4,5,6,7,17',['labor_dispute']);set(19,'8',['employed']);set(19,'9',['unemployed']);set(19,'12,14,15',['work_injury']);set(19,'16',['work_injury','bereavement']);
  set(20,'12',['infant_care','specific_health']);
  set(21,'5',['job_search','abroad']);set(21,'8',['abroad','driving']);
  set(22,'8',['mental_crisis']);
  set(23,'1,4,5,6',['education_transition']);set(23,'9,10,11,12,13',['job_search']);
  set(24,'4',['specific_health']);set(24,'5',['chronic_care']);set(24,'7',['legal_case']);set(24,'10,11',['disability_care']);
  set(27,'5',['pregnancy','specific_health']);set(27,'12,13,14,15',['infant_care']);
  set(28,'7',['specific_health']);set(28,'8',['appearance_care','mental_crisis']);
  set(29,'1,4,5,8,9',['bereavement']);set(29,'2',['specific_health']);set(29,'3',['unemployed']);set(29,'6',['limited_support']);set(29,'7',['bereavement','parenting']);set(29,'10',['marriage']);set(29,'13',['debt','mental_crisis']);
  set(30,'1,2,12',['student_care','specific_health']);
  set(31,'5,6',['veteran']);set(31,'8',['employed','education_transition']);set(31,'10',[]);set(31,'11,12',['freelance']);set(31,'14',['job_search','abroad']);set(31,'15',['freelance']);set(31,'16',['business']);
  set(33,'1',['disability_care','specific_health']);set(33,'3',['mental_crisis']);set(33,'8',['disability_care','infant_care']);set(33,'10',['disability_care','job_search']);set(33,'14',['disability_care','student_care']);set(33,'15',['disability_care','driving']);set(33,'18,19',['disability_care','legal_case']);set(33,'20',['disability_care','labor_dispute']);
  var rows={};
  root.LifeCatalog.all.forEach(function (card) {
    var requires=(overrides[card.id] || defaults[card.chapterId] || ['specific_health']).slice();
    // 跨章专业内容保护：标题中的专业操作不能被通用章节或兴趣归类放行。
    if (/ICP|等保|等级保护|选服务器|服务器放境内|增值电信|算法备案|App.*个人信息|公众提供生成式 AI/.test(card.title)) requires=['site_operator'];
    if (/工伤认定|工伤待遇|劳动能力鉴定|工亡/.test(card.title) && card.id!=='source-25-9' && requires.indexOf('work_injury')<0) requires.push('work_injury');
    if (requires.indexOf('specific_health')>=0) {
      var healthId='health_'+card.id.replace(/-/g,'_');
      var healthTitle='符合这条原文写明的适用条件：'+card.title;
      requires.push(healthId);labels[healthId]=healthTitle;
      contexts.push({id:healthId,title:healthTitle});
    }
    rows[card.id]={requires:requires,mode:requires.length?'conditional':'general',reason:requires.length?'仅在明确确认以下前提后推荐：'+requires.map(function (id) {return labels[id];}).join('；'):'适合作为日常预防或通用方法探索；具体做法仍以原文条件为准。'};
  });
  function get(input) {
    var row=rows[typeof input==='string'?input:input&&input.id];
    return row ? {requires:row.requires.slice(),reason:row.reason,mode:row.mode} : null;
  }
  function eligible(input,context) {
    var row=get(input);if(!row)return false;
    var flags=Array.isArray(context)?context:[];
    return row.requires.every(function (id) {return flags.indexOf(id)>=0;});
  }
  root.LifeApplicability={contexts:contexts,get:get,eligible:eligible};
}(window));
