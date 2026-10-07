# AGENTS.md — 接手说明（人生之书 / life-deck）

给接手的 agent 看的上下文。读完这份你就知道：这是什么、源数据哪来的、**小红书工具包里什么能加什么不能加**、怎么改怎么验。

## 0. 一句话概览

「人生之书」是一个**小红书小工具**（H5 卡牌游戏）：选人生方向 → 踏上旅途 → 收集 10 张人生建议卡 → 出「旅途结算」（避开哪些坑 / 拿到哪些收益，游戏化量化）→ 生成 1080×1440 战报图存相册。
纯原生 JS（经典脚本，无构建、无依赖），全离线，数据只存 localStorage。

## 1. 仓库与可访问地址

- **仓库（public，直接 clone 接手）**：https://github.com/hotcoffeeshake/life-deck
- **在线体验（GitHub Pages，main 分支根目录）**：https://hotcoffeeshake.github.io/life-deck/
- **小红书工具包下载（Release v8.2）**：https://github.com/hotcoffeeshake/life-deck/releases/latest
- 当前版本：**v8.2 旅途版**（608 条建议卡）

```bash
git clone https://github.com/hotcoffeeshake/life-deck.git
cd life-deck
python3 -m http.server 8796 --bind 127.0.0.1 --directory .   # 起本地服务
# 打开 http://127.0.0.1:8796
```

## 2. 源数据（务必知道出处）

- **上游仓库**：https://github.com/eternity4719/HowToLiveBetter
  「高性价比人生指南」——每条建议写明成本、收益、证据等级和原始出处，只引期刊论文与官方文件。
- **本项目用的快照**：2026-09-26，commit `8276caec9508c11c5c80a65440b17895023e2fb9`
  - 生成物：`assets/sources.js`（608 条，含原文正文、来源、成本/收益标签）
  - 上游原文副本：`sources/upstream/`（已去掉其 .git，作为普通文件保留）
  - 重新生成：`python3 scripts/build_content.py`
- **许可证（重要，别搞错）**：
  - 我们收录的这份快照（commit 8276caec）当时上游 LICENSE 是 **Unlicense**（公有领域）。
  - 上游仓库**现已改为 CC-BY-4.0**（2026-10 核查）。**同步上游新内容时必须保留署名（BY）**，并注明来源链接与 commit。
  - 本仓库代码与产品文案：MIT（`LICENSE`）。原文部分按上游许可证处理。

## 3. 小红书工具包的可加 / 不可加（核心边界）

目标产物是**可上传到小红书的小工具包**：ZIP 内只有 `index.html` + `assets/`，纯离线、无网、不跳外链。
**唯一权威的边界是 `scripts/package_xhs.py` 里的断言**——它会在打包时直接 assert 失败，任何一条不满足都打不出包。

### 3.1 硬性禁止（脚本会拦）

产物形态：
- ZIP 内**只能**有 `index.html` 和 `assets/*`，且后缀限于 `.html .css .js .svg .jpg .png .webp .woff2`
- ZIP 内 `.html` **只能有一个**（单入口）；不得混入 `design/`、`sources/upstream/`、含「写实」字样的资源
- 总体积 **< 2 MB**

HTML（`index.html`）：
- 不能有**内联 `<script>`**；所有脚本必须是 `<script src="./assets/xxx.js"></script>` 经典脚本
- 不能有 `type="module"`（无 ESM）
- 不能有 `on*=` 内联事件属性
- 不能有 `<iframe>` / `<object>` / `<base>`
- **全文不得出现 `http://` 或 `https://` 字符串**（即：任何外链、CDN、字体外链、图片外链都不行，必须本地化）

JS（`assets/*.js`，`sources.js` 豁免）：
- 禁止 `fetch(`、`XMLHttpRequest` —— **不能联网**
- 禁止 `window.open(` —— **不能外跳**
- 禁止 `navigator.clipboard`
- 禁止 `eval(`、`new Function`、`new Worker`
- 禁止 `postNote(`、`.getStorage(`（原生宿主桥调用）

CSS / 资源引用：
- `index.html` 里 `src`/`href="./xxx"` 必须真实存在
- `assets/style.css` 里 `url(...)` 引用的必须是本地存在的文件（不能是远程图片/字体）

### 3.2 因此，「不能加」的功能（推论）

| 想加的东西 | 能不能加 | 原因 |
|---|---|---|
| 统计埋点、后端接口、云存档 | ❌ | 禁 fetch / XHR，要求全离线 |
| 外跳链接、分享到站外、客服链接 | ❌ | HTML 内不得出现 http(s)://；禁 window.open |
| CDN 字体 / 远程图片 / 第三方 SDK | ❌ | 同上，且资源必须本地存在 |
| 复制文案按钮 | ❌ | 禁 navigator.clipboard |
| 登录、支付、账号体系 | ❌ | 无网络、无宿主能力，且产品定位是离线小工具 |
| Web Worker / 动态求值 | ❌ | 脚本显式禁止 |
| 新的本地 JS 模块（ESM import） | ❌ | 禁 type="module"，只能用经典脚本 + 全局变量 |
| 加新卡、改文案、改 UI、改结算规则 | ✅ | 本地改完重跑测试 + 重打包即可 |
| 换皮、换配色、加 SVG 插画 | ✅ | 资源放 `assets/`，本地引用 |

> 想真的加联网/分享能力，得先改产品形态（不做小红书小工具包，改为普通 H5），并同步放宽 `package_xhs.py` 的断言——**这是需要人拍板的方向变更，不要擅自放宽**。

### 3.3 内容与文案边界（不写在断言里，但必须守）

- **一条原文 = 一张牌**，共 608 条。正文、来源引用、备注**完整保留，不改写、不删减**；「说人话」字段名隐藏但内容保留。
- **不虚构收益数字**。卡面/结算里的量化只能由原文「收益等级（大/中/小）+ 收益形式（金钱/时间/自由/死亡率）」折算：
  点数 大=3 中=2 小=1；游戏化量级：金钱 500/200/50 元每月，时间 60/30/10 分钟每天，健康（原文口径死亡率）3/1.5/0.5 岁，自由 4/2/1 个傍晚每月；战力评级 S≥24 / A≥18 / B≥12 / C。
  页面上**必须保留边界话术**（"游戏化折算，帮你感受方向，不是精算承诺"）。
- **不要宣称**这是验证过的心理或生活质量量表。
- **被测试锁定的文案不要动**（改了测试会红，且是产品已确认的措辞）：
  - 单测锁定：`needs` 标题「你现在最想做到什么？」、`breadth` 标题「想看看其他领域的建议吗？」
  - 浏览器测试锁定：「提高学习效率」、「在职」、「未写入相册」
- 小红书战报图规格 **1080×1440**（3:4）；阅读分页图 **1080×1560**。

## 4. 目录结构

```
index.html                 单入口，按序加载 assets/*.js（经典脚本）
assets/
  style.css                全部样式（含 v8 旅途版、8 领域主题色、卡面、结算 HUD）
  sources.js               上游 608 条原文（脚本生成，勿手改）
  content.js               原文 → 卡结构的解析
  catalog.js               卡库与检索
  routes.js                8 领域 → 40 子主题路由 + 领域图标/主题色/单字印章
  applicability.js         适用前提过滤
  interests.js             兴趣/画像
  exploration.js           问答流程（profile → need → 推荐 → 换牌）
  reading.js               阅读页与分页图
  core.js                  状态、存档、牌组
  platform.js              海报/战报图 canvas 绘制、存相册桥
  app.js                   渲染与交互、旅途结算、卡组评估
scripts/
  build_content.py         从 sources/upstream 生成 assets/sources.js
  package_xhs.py           打小红书上传包 + 全部边界断言
tests/
  *.test.cjs               node --test 单元测试（59 项）
  browser.cjs              Playwright 全流程浏览器测试（需先起本地服务）
design/                    设计稿、截图、路由表、打包检查
sources/upstream/          上游原文快照（2026-09-26, commit 8276caec）
```

## 5. 改完之后怎么验（必跑）

```bash
node --test tests/*.test.cjs        # 59 项单测，必须全绿
python3 -m http.server 8796 --bind 127.0.0.1 --directory . &
node tests/browser.cjs              # 全流程浏览器测试，必须 PASS
python3 scripts/package_xhs.py      # 重打小红书上传包（跑完会写 design/打包检查.json）
```

浏览器测试覆盖：求职与网站运营隔离、适用前提确认/拒绝、点选自动收集、牌组二次阅读、目标路由前三组命中与跨领域选择、费用收益标签、左划与键盘换牌、连点、10 张上限与移除补齐、刷新与旧存档、估算自动保存、相册桥模拟、608 个题面窄屏排版与离线加载。
浏览器测试复用本机已装的 Playwright（`/Users/qichenxie/.cache/codex-runtimes/.../playwright`），无 node_modules。

## 6. 已知未完成 / 下一步可做

- 真机验收：小红书 WebView 内的动效性能、相册授权与保存（目前只是桥模拟，不代替真机）。
- 视觉风格未最终定稿（当前是中性排版 + 线稿旅途徽章），写实角色图未采用。
- 题库与画像未经用户试答校准。
- 折算量级（500/200/50 等）是我定的基准，可调；评级门槛同理。
- 未提交小红书平台审核、未发布。

## 7. 版本脉络

v1–v6 原型 → v7 目标/阶段路由与适用前提 → **v8 旅途版**（冒险者叙事、8 领域印章与主题色、10 步旅途进度、旅途结算、1080×1440 战报图、文案统一）
→ **v8.2**（收益游戏化量化：战力评级 S/A/B/C + 币/时/龄/闲/盾 HUD + 激励向结算文案）。

改完记得同步 `README.md` 的「已实现」小节，并重打 Release 上传包。
