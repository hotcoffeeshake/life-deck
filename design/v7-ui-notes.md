# v7 页面实现说明（Sonnet 5）

改动记录：卡面标题统一为原文 `card.title`；成本/收益字段为 null/undefined 时整块隐藏；反面清单（`Routes.get(c).discouragement`）加“这是一条劝阻”标识与代价读法说明；点卡自动收下并前进，左划整组换牌，无独立加入/继续/兴趣按钮；底部固定牌组，点已收卡看全文；目标页改用 `Explore.needs(state)` 的具体 goal 选项，不再用旧 money/energy/direction 三桶文案；新增“补充情况”面板调用 `Explore.contextOptions`/`Explore.setContext`，允许在职与求职并存、可撤销事实；新增 5 秒撤回条，调用 `Explore.undo`，不改变偏好；收满 10 张后候选卡置灰并提示“这次已经收满 10 张了”，全库点击已收藏卡直接阅读不再报错；候选不足时给出换目标/看全部建议等出口。仅使用现有 Opus contract 中已声明的 API（question/answer 通用结构、setContext/contextOptions/undo/goals via needs），未发明未实现接口。

集成结果：已接入 Opus 实际引擎，并修正测试中的旧接口和重复变量；浏览器检查通过具体的学生/求职首组、10 张收集、撤回、估算、全文分页和 v6 迁移。最终页面已交由 Opus 结合截图审阅，提出的一处工作状态互斥修复已应用并增加回归检查。
