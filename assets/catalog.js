(function (root) {
  'use strict';
  // 分类与阶段是本产品的编辑标签，仅供排序；不改写原文，不限制任何条目的访问。
  // chapterId + 原文三级标题顺序构成稳定 ID；原文标题中的序号不用于定位。
  var money = [
    ['bills', 'student earlywork working family retired', '有些会员已经不用了，却还在每月扣钱吗？'],
    ['finance', 'earlywork working changing family', '每年做个税汇算时，你知道哪些扣除可以填吗？'],
    ['housing', 'earlywork working changing family', '没有买房，公积金里的钱还能怎么用？'],
    ['bills', 'student earlywork working family retired', '手机和宽带每月花多少，有没有用不上的套餐？'],
    ['finance', 'student earlywork working retired', '你会把买彩票当作一笔有机会回本的钱吗？'],
    ['safety', 'student earlywork working family retired', '有人推荐“保本高收益”，怎么判断靠不靠谱？'],
    ['finance', 'student earlywork working family', '信用卡最低还款和消费分期，最后会多花多少？'],
    ['shopping', 'student earlywork working family', '直播打赏、游戏充值和冲动下单，哪笔花完后悔？'],
    ['family', 'family', '孩子背着家长充值打赏，这笔钱还能追回吗？'],
    ['family', 'family', '有人让孩子拿家长手机操作，该怎么提前提醒？'],
    ['shopping', 'student earlywork working family', '买电子产品时，额外付钱的延保值得买吗？'],
    ['health', 'working family retired', '同一种药价格差很多，仿制药能不能选？'],
    ['health', 'working family retired', '自己的医保账户余额，能不能给家人看病用？'],
    ['food', 'student earlywork working family retired', '日常喝水这笔钱，有没有更省的选择？'],
    ['finance', 'working family retired', '股票买卖得越勤，是不是反而更难赚到钱？'],
    ['finance', 'earlywork working family retired', '借钱投资或加杠杆，最坏会损失多少？'],
    ['finance', 'earlywork working family retired', '准备长期投资时，指数基金和主动基金怎么选？'],
    ['finance', 'earlywork working family retired', '买同类基金时，你比较过每年的费率吗？'],
    ['finance', 'working family retired', '钱都放在一只股票、一个平台或一套房上吗？'],
    ['finance', 'earlywork working family', '个人养老金能省税，但你的情况适合开户吗？'],
    ['shopping', 'student earlywork working family', '还没养成健身习惯，要不要先办一张年卡？'],
    ['shopping', 'working family retired', '办卡充值后担心店家跑路，付款前能做什么？'],
    ['shopping', 'student earlywork working family retired', '看中一件贵但不急用的东西，要马上下单吗？'],
    ['shopping', 'student earlywork working family retired', '看到划线价和大促，你会买下暂时用不着的东西吗？'],
    ['finance', 'earlywork working family retired', '买保险时，返还和分红是不是一定能拿到？'],
    ['travel', 'working family retired', '开车有了交强险，还需要考虑多少三者险？'],
    ['finance', 'earlywork working changing family', '如果几个月没有收入，你手头的钱够生活吗？'],
    ['housing', 'working family', '有一笔闲钱，要不要拿去提前还房贷？'],
    ['shopping', 'student earlywork working family retired', '网购时，主播推荐和大量好评真的能放心信吗？'],
    ['shopping', 'student earlywork working family retired', '直播间买到问题商品，找不到卖家该怎么办？'],
    ['food', 'student earlywork working family retired', '买到不安全的食品，除了退款还能主张什么？'],
    ['shopping', 'earlywork working family', '买家电等大件前，哪些质量信息值得先查？'],
    ['shopping', 'student earlywork working family retired', '手串、玉石和名表，应该算消费还是存钱？'],
    ['shopping', 'working family retired', '买珠宝玉石时，怎么查检测报告是否可信？'],
    ['shopping', 'student earlywork working family', '买盲盒和抽卡前，你能接受这笔钱收不回来吗？'],
    ['food', 'student earlywork working family retired', '想看清食品配料，散装和预包装有什么区别？'],
    ['finance', 'earlywork working family retired', '股票已经亏了，还要继续补仓等它回本吗？'],
    ['finance', 'earlywork working family retired', '行情突然大涨大跌时，要不要跟着多买多卖？']
  ];
  var defaults = {
    1:'safety',2:'health',3:'time',4:'time',5:'finance',6:'safety',7:'finance',8:'safety',9:'safety',10:'relationships',11:'work',12:'work',13:'safety',14:'safety',15:'housing',16:'health',17:'family',18:'family',19:'work',20:'family',21:'travel',22:'time',23:'learning',24:'health',25:'family',26:'work',27:'family',28:'health',29:'health',30:'family',31:'choices',32:'learning',33:'health'
  };
  // 先用条目标题里的明确主题，再用章节主题兜底。正文里偶然提到的词不参与归类。
  var rules = [
    ['bills', /自动续费|宽带|手机.*套餐|电话.*套餐|会员费/],
    ['housing', /租房|房东|房租|房贷|买房|租赁合同|公积金/],
    ['food', /食品|饮食|食物|饮水|自来水|做饭|吃饭|吃菜|外卖/],
    ['travel', /开车|骑车|驾车|交通|安全带|头盔|旅行|出行|护照|签证|车险|航班|机票/],
    ['family', /孩子|儿童|婴儿|婴幼儿|新生儿|老人|父母|长辈|怀孕|孕妇|产检|产假|托育/],
    ['work', /劳动合同|工资|加班|离职|失业|工伤|就业|工作.*合同|老板|招聘|创业|公司注册/],
    ['finance', /基金|股票|储蓄|应急金|借贷|信用卡|贷款|投资|养老金|个税|财产/],
    ['shopping', /网购|购物|下单|充值|打赏|预付|买.*件|盲盒|抽卡|珠宝|玉石|商家|退货/],
    ['health', /就医|看病|挂号|药物|药品|医保|疫苗|体检|筛查|慢性病|睡眠|睡觉|运动|急救/],
    ['safety', /诈骗|骗子|法律|报警|火灾|中毒|密码|账号|验证码|隐私|侵权/],
    ['learning', /学会|学习|技能|读书|留学|考试|学历|培训/],
    ['relationships', /恋爱|婚姻|结婚|离婚|伴侣|朋友|人际|社交/]
  ];
  function classify(chapter, title) {
    for (var i=0;i<rules.length;i++) if (rules[i][1].test(title)) return rules[i][0];
    return defaults[chapter.id] || 'choices';
  }
  function stages(chapter, title) {
    var out=[];
    if (/孩子|婴儿|新生儿|怀孕|孕妇|父母|老人|长辈/.test(title) || [17,18,20,27,30].indexOf(chapter.id)>=0) out.push('family');
    if (/老人|养老|退休/.test(title)||chapter.id===17) out.push('retired');
    if (/十八岁|学生|上学|毕业|大学|留学/.test(title)||[31,32].indexOf(chapter.id)>=0) out.push('student');
    if (/毕业|第一份|找工作|就业|租房/.test(title)||chapter.id===31) out.push('earlywork');
    if (/工资|工作|劳动|加班|个税|创业/.test(title)||[11,12,19,26].indexOf(chapter.id)>=0) out.push('working');
    if (/离职|失业|离婚|搬家|转行|重大打击/.test(title)||chapter.id===29) out.push('changing');
    return out;
  }
  function field(text, name) {
    // 取字段的全部文字及续行，直到下一个顶层字段；text 自身始终逐字保留。
    var re = new RegExp('^- '+name+'[：:]\\s*([\\s\\S]*?)(?=^-[ \\t]+[^\\n：:]+[：:]|$(?![\\s\\S]))', 'm');
    var match = re.exec(text);
    return match ? match[1].replace(/\s+$/, '') : '';
  }
  var all=[], byId={};
  root.LifeSources.chapters.forEach(function (chapter) {
    var headings=[], re=/^###[ \t]+([^\r\n]+)\r?$/gm, m;
    while ((m=re.exec(chapter.text))) headings.push({at:m.index,heading:m[1]});
    headings.forEach(function (h,index) {
      var text=chapter.text.slice(h.at, index+1<headings.length ? headings[index+1].at : chapter.text.length);
      var title=h.heading.replace(/^\d+[.、．][ \t]*/, '');
      var row=chapter.id===5 ? money[index] : null;
      var group=row ? row[0] : classify(chapter,title);
      var stageTags=row ? row[1].split(' ') : stages(chapter,title);
      var tags=[group].concat(stageTags);
      // 第5章全部与省钱相关，其他章节按条目主题补充兴趣标签，不影响完整浏览。
      if(chapter.id===5 || /省钱|少花钱|免费|费用|退费|退款|赔偿|补贴|报销|成本/.test(title)) tags.push('money');
      var id='source-'+chapter.id+'-'+(index+1);
      var item={id:id,title:title,question:row ? row[2] : title,chapterId:chapter.id,chapterTitle:chapter.title,heading:h.heading,text:text,url:chapter.url,tags:tags,group:group,steps:[],benefit:field(text,'收益'),calc:id==='source-5-1' ? 'subscription' : id==='source-5-4' ? 'plan' : null,chapters:[chapter.id],sourceLabel:'《HowToLiveBetter》第'+chapter.id+'章 · '+chapter.title,boundary:'以下是仓库原文，保留作者的说法、来源和备注；未逐条核验。',sourceOriginal:true};
      all.push(item);byId[id]=item;
    });
  });
  root.LifeCatalog={all:all,get:function(id){return byId[id] || null;}};
}(window));
