# SinoCraft Vis

> 华构工韵：中国古建筑数字可视化系统

SinoCraft Vis 是一个基于 Vue 3、Vite、ECharts、Three.js 和 Electron 构建的中国古建筑可视化项目。项目以首页粒子门户作为统一入口，串联空间分布、历史演化、形制结构、材料工艺、保护风险五个专题大屏，用地图、图表、表格、关系图和交互式粒子场景展示中国古建筑的空间分布、历史脉络、结构形制、营造材料与保护状态。

## 当前功能

- 首页门户：`HomePage.vue` 使用 Three.js 将古建筑模型采样为粒子形态，支持滚轮进入专题粒子导航区。
- 专题导航：五个专题以横向粒子卡片呈现，支持鼠标滚轮横向切换、底部圆点切换和点击进入专题。
- 专题返回：每个专题页都有返回入口，返回后会定位到对应的首页粒子卡片，例如 `index.html#topic-structure`。
- 页面转场：内部专题跳转统一使用过渡遮罩；从首页进入专题时显示居中加载面板、专题名称和进度百分比。
- 多大屏展示：空间分布、历史演化、形制结构、材料工艺、保护风险分别作为独立 Vite HTML 入口构建。
- 桌面端支持：项目已配置 Electron 和 electron-builder，可打包为 Windows 桌面应用。

## 专题页面

| 专题 | 入口文件 | Vue 入口 | 说明 |
| --- | --- | --- | --- |
| 首页门户 | `index.html` | `src/main.js` / `src/HomePage.vue` | 粒子模型首页与五个专题导航 |
| 空间分布大屏 | `spatial.html` | `src/apps/spatial/main.js` | 全国与省级地图、文保单位空间分布、统计图表 |
| 历史演化大屏 | `history.html` | `src/apps/history/main.js` | 朝代切换、地图分布、建筑类型与代表建筑图文 |
| 形制结构大屏 | `structure.html` | `src/apps/structure/main.js` | 建筑样本筛选、结构维度、地图点位、数据表格 |
| 材料工艺大屏 | `materials.html` | `src/apps/materials/main.js` | 材料来源地图、修复流程、材料病害与工艺图表 |
| 保护风险大屏 | `protection.html` | `src/apps/protection/main.js` | 保护现状、风险预警、数字化进度、投入与病害分析 |

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端框架 | Vue 3 |
| 构建工具 | Vite |
| 可视化 | Apache ECharts、echarts-wordcloud |
| 3D / 粒子 | Three.js |
| 表格数据解析 | xlsx |
| 桌面端 | Electron、electron-builder |
| 样式 | CSS、Vue SFC scoped style |

## 环境要求

建议使用：

- Node.js 18.18+ 或 Node.js 20+
- npm 9+

依赖版本以 `package.json` 和 `package-lock.json` 为准。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

开发服务启动后，根据终端提示访问本地地址，通常是：

```text
http://localhost:5173/
```

## 桌面端运行与打包

```bash
# 直接启动 Electron
npm run start

# 构建 Web 产物后用 Electron 预览
npm run electron:preview

# 生成未安装版目录
npm run pack

# 生成 Windows 安装包 / 便携包
npm run dist
```

打包输出目录为：

```text
release/
```

已打包的 Windows 未安装版通常位于：

```text
release/win-unpacked/SinoCraft Vis.exe
```

运行桌面版时不要只复制单个 `.exe`，需要保留整个 `win-unpacked` 目录结构，包括 `resources/`、`locales/`、`.dll`、`.pak` 等文件。

## 项目结构

```text
SinoCraft Vis/
├─ index.html                 # 首页门户入口
├─ spatial.html               # 空间分布大屏入口
├─ history.html               # 历史演化大屏入口
├─ structure.html             # 形制结构大屏入口
├─ materials.html             # 材料工艺大屏入口
├─ protection.html            # 保护风险大屏入口
├─ vite.config.js             # 多页面构建配置
├─ package.json               # 脚本、依赖和 Electron 打包配置
├─ electron/                  # Electron 主进程配置
├─ public/                    # 静态资源
└─ src/
   ├─ main.js                 # 首页 Vue 挂载入口
   ├─ App.vue                 # 首页根组件
   ├─ HomePage.vue            # 首页粒子门户和专题导航
   ├─ pageTransition.js       # 页面转场、专题加载面板逻辑
   ├─ pageTransition.css      # 页面转场和返回按钮全局样式
   ├─ portal.css              # 首页基础样式
   ├─ components/
   │  └─ TopicParticleSculpture.vue
   └─ apps/
      ├─ spatial/             # 空间分布大屏
      ├─ history/             # 历史演化大屏
      ├─ structure/           # 形制结构大屏
      ├─ materials/           # 材料工艺大屏
      └─ protection/          # 保护风险大屏
```

## 关键文件说明

### 首页门户

- `src/HomePage.vue`：首页粒子模型、专题横向导航、滚轮进入专题区、hash 定位恢复。
- `src/components/TopicParticleSculpture.vue`：专题卡片中的粒子雕塑效果。
- `src/pageTransition.js`：内部页面跳转拦截、转场遮罩、专题加载进度。
- `src/pageTransition.css`：转场样式、居中加载面板、全局返回按钮样式。

### 空间分布大屏

- `src/apps/spatial/App.vue`：主页面、全国地图、省级地图切换、图表初始化。
- `src/apps/spatial/assets/china.json`：全国地图数据。
- `src/apps/spatial/assets/maps/province/*.json`：省级地图数据。
- `src/apps/spatial/assets/1911 年前全国文物保护单位数据.xlsx`：空间分布使用的文保单位数据源。

### 历史演化大屏

- `src/apps/history/App.vue`：历史专题根组件。
- `src/apps/history/components/HistoryChart.vue`：历史演化大屏核心逻辑，包含地图、朝代切换、建筑详情、热力图等。
- `src/apps/history/assets/中国_省.geojson`：当前实际使用的中国省级 GeoJSON。
- `src/apps/history/assets/buildings/`：代表性建筑图片。

### 形制结构大屏

- `src/apps/structure/App.vue`：结构专题主体布局、筛选、图表和可调面板。
- `src/apps/structure/components/ChinaDistributionMap.vue`：基于 GeoJSON 自绘 SVG 中国地图。
- `src/apps/structure/components/DataTable.vue`：结构样本表格，估算值会以红色小徽标标识。
- `src/apps/structure/components/BaseChart.vue`：ECharts 基础封装。
- `src/apps/structure/assets/maps/china.json`：结构专题地图数据。
- `src/apps/structure/data/architectureData.js`：结构样本主数据与最终合并导出。
- `src/apps/structure/data/architectureSupplement.js`：补充样本。
- `src/apps/structure/data/architectureMoreSupplement.js`：更多补充样本。
- `src/apps/structure/data/architectureLatestSupplement.js`：最新补充样本。

### 材料工艺大屏

- `src/apps/materials/App.vue`：材料工艺专题主页面。
- `src/apps/materials/components/SourceMap.vue`：材料来源地图和飞线。
- `src/apps/materials/china.json`：材料专题地图数据。
- `src/apps/materials/components/`：材料占比、修复流程、桑基图、树图、时间线等图表组件。

### 保护风险大屏

- `src/apps/protection/App.vue`：保护风险专题主页面与面板交互。
- `src/apps/protection/components/architectureData.js`：保护风险专题内置统计数据。
- `src/apps/protection/components/`：风险雷达、状态饼图、病害排行、交叉热力图、资金投入、数字化进度等图表组件。

## 地图数据位置

| 专题 | 地图数据 | 使用位置 |
| --- | --- | --- |
| 空间分布 | `src/apps/spatial/assets/china.json` | `src/apps/spatial/App.vue` |
| 空间分布 | `src/apps/spatial/assets/maps/province/*.json` | `src/apps/spatial/App.vue` 动态加载 |
| 历史演化 | `src/apps/history/assets/中国_省.geojson` | `src/apps/history/components/HistoryChart.vue` |
| 形制结构 | `src/apps/structure/assets/maps/china.json` | `src/apps/structure/components/ChinaDistributionMap.vue` |
| 材料工艺 | `src/apps/materials/china.json` | `src/apps/materials/components/SourceMap.vue` |

保护风险大屏当前没有使用 GeoJSON 地图边界数据。

## 数据说明

- 项目中的专题数据多数以内置 JS、JSON、GeoJSON、图片和 Excel 文件形式存放在 `src/apps/*` 目录内。
- 形制结构专题的建筑样本包含部分估算字段。界面会保留数值显示，并用红色 `估` 徽标提示估算口径。
- 空间分布专题会读取 Excel 数据；若读取失败，页面内有兜底模拟数据。
- 数据字段中的 `source` / `sourceNote` 用于记录来源链接与口径说明，便于后续替换为更完整的数据接口。

## 构建说明

当前 `vite.config.js` 使用多页面入口：

```js
input: {
  main: resolve(__dirname, 'index.html'),
  protection: resolve(__dirname, 'protection.html'),
  structure: resolve(__dirname, 'structure.html'),
  materials: resolve(__dirname, 'materials.html'),
  spatial: resolve(__dirname, 'spatial.html'),
  history: resolve(__dirname, 'history.html')
}
```

项目配置了：

```js
base: './'
```

这样构建后的 `dist/` 更适合 Electron、本地静态预览和相对路径部署。

## 常见问题

### 1. 专题页返回首页后为什么能定位到对应粒子卡片？

专题页返回链接使用 hash，例如：

```text
./index.html#topic-structure
```

`HomePage.vue` 会在挂载时读取 hash，并横向滚动到对应专题。

### 2. 为什么专题跳转进度不是严格真实资源进度？

当前进度是页面转场中的体验型加载进度。它基于跳转动画模拟推进，并在专题页进入时补到 100%。如果需要真实资源加载百分比，需要各专题页上报资源加载状态，成本更高。

### 3. 为什么构建时有 chunk 体积警告？

历史演化、Three.js、ECharts 和大体积地图 / 模型资源会让部分 chunk 超过 Vite 默认警告阈值。当前警告不影响构建成功。后续可以通过动态导入或 `manualChunks` 做拆包优化。

## 后续维护建议

- 将各专题内置数据逐步拆分为独立 JSON 或后端接口。
- 为地图数据建立统一目录和命名规范，减少不同专题重复维护中国地图数据。
- 对大体积页面做动态导入和按专题拆包，降低首屏加载压力。
- 补充数据来源说明和许可证文件，方便对外发布或参赛归档。
- 为关键组件增加最小化测试或截图检查，避免后续布局改动影响大屏展示。

## 许可证

当前仓库暂未声明开源许可证。如需公开发布，请根据作品授权范围补充 `LICENSE` 文件。
