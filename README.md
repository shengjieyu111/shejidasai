# SinoCraft Vis

> 华构工韵 -- 古建筑材料与工艺数据可视化系统

SinoCraft Vis 是一个基于 Vue 3、Vite 和 ECharts 构建的中国古建筑可视化大屏。项目围绕唐、宋、元、明、清五个历史阶段，整合古建筑数量、空间分布、建筑类型、保存状态、修缮情况和代表性建筑图文资料，用交互式图表呈现古建筑材料与营造工艺的时空演变。

## 项目亮点

- 历史时间轴：支持唐、宋、元、明、清与全部数据切换，并带有自动轮播播放控制。
- 中国地图分布：基于地图 GeoJSON 展示各省古建筑数量分布，支持点击省份联动建筑详情。
- 多维图表分析：包含风格演变趋势、建筑类型占比、保存状态、修缮次数、朝代-类型热力图、省份 TOP 排名变化等视图。
- 建筑图文档案：内置故宫、天坛、应县木塔、大雁塔、拙政园、龙门石窟奉先寺等代表性建筑图片和简介。
- 大屏交互体验：图表可放大预览，省份建筑列表支持详情弹窗，中心地图详情区域支持拖拽调整高度。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端框架 | Vue 3 |
| 构建工具 | Vite |
| 数据可视化 | Apache ECharts |
| 地图数据 | 中国地图 GeoJSON / JSON |
| 样式 | CSS / Vue SFC scoped style |

## 环境要求

项目当前使用 Vite 8，建议使用以下 Node.js 版本：

- Node.js `^20.19.0` 或 `>=22.12.0`
- npm 10+，或与当前 Node.js 版本匹配的 npm

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 生产构建
npm run build

# 本地预览构建产物
npm run preview
```

开发服务启动后，按终端提示访问本地地址，通常为：

```text
http://localhost:5173/
```

## 项目结构

```text
SinoCraft Vis/
├── public/                 # 公共静态资源
├── src/
│   ├── assets/
│   │   ├── buildings/      # 古建筑图片资源
│   │   ├── china.geojson   # 中国地图数据
│   │   ├── hero.png        # 页面资源图
│   │   └── map.json        # ECharts 地图数据
│   ├── components/
│   │   └── HistoryChart.vue # 可视化大屏核心组件
│   ├── App.vue             # 应用入口组件
│   ├── main.js             # Vue 挂载入口
│   └── style.css           # 全局样式
├── index.html              # Vite HTML 入口
├── package.json            # 依赖与脚本
├── vite.config.js          # Vite 配置
└── README.md
```

## 核心功能

### 1. 历史朝代筛选

系统以唐、宋、元、明、清为主线，支持按朝代查看数据，也支持汇总查看全部数据。切换朝代后，地图、排行、类型占比和保存状态等图表会同步更新。

### 2. 空间分布可视化

中心区域展示中国古建筑空间分布图，并结合省份排行图呈现不同朝代下的区域分布差异。当前重点统计省份包括北京、山西、陕西、河南、浙江、江苏、福建、安徽和湖南等。

### 3. 建筑类型与工艺趋势

系统从皇宫、官府、民居、桥梁等建筑类型出发，结合斗拱、砖石、园林、彩绘等风格指标，展示不同历史阶段古建筑类型与营造工艺的变化趋势。

### 4. 代表建筑详情

点击地图省份后，下方会展示该省对应朝代的代表建筑列表。点击建筑卡片可查看建筑图片、年代、朝代、城市和详情介绍。

## 数据说明

- 地图数据位于 `src/assets/map.json` 与 `src/assets/china.geojson`。
- 建筑图片位于 `src/assets/buildings/`，当前包含 42 张代表性古建筑图片。
- 统计数据和建筑详情数据目前内置在 `src/components/HistoryChart.vue` 中，包含朝代、省份、建筑类型、保存状态、修缮次数和建筑简介等信息。
- 数据来源字段中使用了方志、考古、国保、三普等标签，便于后续替换为更完整的数据源或接口服务。

## 构建与部署

执行以下命令生成静态资源：

```bash
npm run build
```

构建产物会输出到 `dist/` 目录，可部署到 GitHub Pages、Vercel、Netlify、Nginx 等静态托管服务。

如果部署到 GitHub Pages 的仓库子路径，例如：

```text
https://<username>.github.io/<repository-name>/
```

需要在 `vite.config.js` 中配置 `base`：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/<repository-name>/',
  plugins: [vue()],
})
```

如果部署到独立域名或 Vercel、Netlify 的根路径，通常无需修改 `base`。

## 可维护方向

- 将内置统计数据拆分为独立 JSON 文件，降低组件体积。
- 接入后端接口或数据库，支持动态数据管理。
- 增加搜索、筛选、对比和导出功能。
- 补充更多省份、建筑类型、材料工艺和保护修缮数据。
- 为 GitHub Pages 增加自动化部署工作流。

## 许可证

当前仓库暂未声明许可证。如需开源发布，建议根据作品授权范围补充 `LICENSE` 文件。
