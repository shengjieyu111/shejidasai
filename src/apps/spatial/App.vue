<template>
  <div class="dashboard-container">
    <a class="portal-return-link" href="./index.html#topic-spatial" aria-label="返回空间专题" title="返回空间专题"></a>

    <!-- 顶部标题栏 -->
    <div class="header">
      <h1>中国古建筑空间分布数据大屏</h1>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：地图展示区域（全国/省份） -->
      <div class="chart-card map-container">
        <div class="map-header" v-if="currentMapType === 'province'">
          <span class="current-province">{{ currentProvince }}省文物保护单位分布</span>
          <button class="back-btn" @click="backToChinaMap">返回全国地图</button>
        </div>
        <div id="china-map-chart" style="width:100%;height:100%;"></div>
      </div>

      <!-- 右侧：省份统计和建筑密度热力图 -->
      <div class="right-column">
        <div class="chart-card" id="province-bar-chart"></div>
        <div class="chart-card" id="density-heatmap-chart"></div>
      </div>
    </div>

    <!-- 底部信息区 -->
    <div class="bottom-content">
      <div class="chart-card" id="type-pie-chart"></div>
      <div class="chart-card" id="protection-level-chart"></div>
      <div class="chart-card" id="time-trend-chart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import chinaMapData from './assets/china.json';
import * as XLSX from 'xlsx'; // 需要安装: npm install xlsx

// 省份名称映射：用于匹配GeoJSON文件
// 省份简称 -> 英文文件名（小写）
const provinceToFile = {
  '北京': 'beijing', '天津': 'tianjin', '上海': 'shanghai', '重庆': 'chongqing',
  '河北': 'hebei', '山西': 'shanxi', '辽宁': 'liaoning', '吉林': 'jilin',
  '黑龙江': 'heilongjiang', '江苏': 'jiangsu', '浙江': 'zhejiang', '安徽': 'anhui',
  '福建': 'fujian', '江西': 'jiangxi', '山东': 'shandong', '河南': 'henan',
  '湖北': 'hubei', '湖南': 'hunan', '广东': 'guangdong', '海南': 'hainan',
  '四川': 'sichuan', '贵州': 'guizhou', '云南': 'yunnan', '陕西': 'shanxi1',
  '甘肃': 'gansu', '青海': 'qinghai', '台湾': 'taiwan', '内蒙古': 'neimenggu',
  '广西': 'guangxi', '西藏': 'xizang', '宁夏': 'ningxia', '新疆': 'xinjiang',
  '香港': 'xianggang', '澳门': 'aomen'
};

// 省份全称 -> 简称（用于 Excel 数据分组）
const fullToShort = {
  '北京市': '北京', '天津市': '天津', '上海市': '上海', '重庆市': '重庆',
  '河北省': '河北', '山西省': '山西', '辽宁省': '辽宁', '吉林省': '吉林',
  '黑龙江省': '黑龙江', '江苏省': '江苏', '浙江省': '浙江', '安徽省': '安徽',
  '福建省': '福建', '江西省': '江西', '山东省': '山东', '河南省': '河南',
  '湖北省': '湖北', '湖南省': '湖南', '广东省': '广东', '海南省': '海南',
  '四川省': '四川', '贵州省': '贵州', '云南省': '云南', '陕西省': '陕西',
  '甘肃省': '甘肃', '青海省': '青海', '台湾省': '台湾', '内蒙古自治区': '内蒙古',
  '广西壮族自治区': '广西', '西藏自治区': '西藏', '宁夏回族自治区': '宁夏',
  '新疆维吾尔自治区': '新疆', '香港特别行政区': '香港', '澳门特别行政区': '澳门'
};

export default {
  name: 'App',
  data() {
    return {
      // 存储所有文物保护单位数据（按省份分组）
      heritageByProvince: new Map(),
      // 当前地图类型: 'china' 或 'province'
      currentMapType: 'china',
      // 当前省份名称（如"山西"）
      currentProvince: '',
      // echarts实例
      chinaMapChart: null,
      barChart: null,
      heatmapChart: null,
      pieChart: null,
      protectionChart: null,
      timeTrendChart: null,
      // 各省份GeoJSON缓存
      provinceGeoCache: new Map()
    };
  },
  async mounted() {
    // 1. 加载并解析Excel数据
    await this.loadHeritageData();
    // 2. 初始化所有图表
    this.initAllCharts();
    // 3. 添加窗口自适应
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    // 销毁所有echarts实例
    const charts = [
      this.chinaMapChart, this.barChart, this.heatmapChart,
      this.pieChart, this.protectionChart, this.timeTrendChart
    ];
    charts.forEach(chart => chart && chart.dispose());
  },
  methods: {
    // ==================== 数据加载 ====================
async loadHeritageData() {
  try {
    const response = await fetch('./assets/1911年前全国文物保护单位数据.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    
    rows.forEach(row => {
      let provinceFull = row['省份'];        // 例如 "安徽省"
      if (!provinceFull) return;
      const provinceShort = fullToShort[provinceFull]; // 转换为 "安徽"
      if (!provinceShort) return;
      
      const name = row['名称'];
      const lng = row['经度84'];
      const lat = row['纬度84'];
      if (!name || !lng || !lat) return;
      
      if (!this.heritageByProvince.has(provinceShort)) {
        this.heritageByProvince.set(provinceShort, []);
      }
      this.heritageByProvince.get(provinceShort).push({
        name: name,
        value: [parseFloat(lng), parseFloat(lat)]
      });
    });
    console.log('文物数据加载完成，共', this.heritageByProvince.size, '个省份');
  } catch (error) {
    console.error('加载Excel数据失败，将使用模拟数据', error);
    this.loadMockData();
  }
},
    // 模拟数据（当Excel加载失败时使用）
    loadMockData() {
      const mockData = {
        '山西': [{ name: '云冈石窟', value: [113.1258, 40.1098] }, { name: '平遥古城', value: [112.184, 37.198] }],
        '河南': [{ name: '龙门石窟', value: [112.4685, 34.5564] }, { name: '少林寺', value: [112.9335, 34.5077] }],
        '陕西': [{ name: '兵马俑', value: [109.2598, 34.3865] }, { name: '大雁塔', value: [108.9594, 34.2198] }],
        '北京': [{ name: '故宫', value: [116.3896, 39.9219] }, { name: '长城', value: [116.024, 40.362] }]
      };
      for (const [province, sites] of Object.entries(mockData)) {
        this.heritageByProvince.set(province, sites);
      }
    },

    // ==================== 图表初始化 ====================
    initAllCharts() {
      this.initChinaMapChart();
      this.initProvinceBarChart();
      this.initDensityHeatmapChart();
      this.initTypePieChart();
      this.initProtectionLevelChart();
      this.initTimeTrendChart();
    },

    initChinaMapChart() {
      const chartDom = document.getElementById('china-map-chart');
      this.chinaMapChart = echarts.init(chartDom);
      echarts.registerMap('china', chinaMapData);
      
      const option = this.getChinaMapOption();
      this.chinaMapChart.setOption(option);
      
      // 绑定点击事件
      this.chinaMapChart.off('click'); // 移除旧监听
      this.chinaMapChart.on('click', (params) => {
        if (params.componentType === 'series' && params.seriesType === 'map') {
          const provinceName = params.name;
          if (provinceName && provinceName !== '南海诸岛') {
            this.showProvinceMap(provinceName);
          }
        }
      });
    },

    // 全国地图配置
    getChinaMapOption() {
      return {
        title: { text: '中国文物保护单位分布地图', left: 'center', textStyle: { color: '#2c3e4e' } },
        tooltip: { trigger: 'item', formatter: '{b}: {c} 处' },
        visualMap: {
          min: 0, max: 400, text: ['高', '低'], realtime: false, calculable: true,
          inRange: { color: ['#f7fbff', '#abd0e6', '#3787c0', '#0d4b74'] }
        },
        series: [{
          name: '文物数量', type: 'map', map: 'china', roam: true, zoom: 1.2,
          layoutCenter: ['50%', '50%'], layoutSize: '120%',
          label: { show: true, fontSize: 12, color: '#2c3e4e' },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' }, itemStyle: { areaColor: '#f39c12' } },
          data: [
            { name: '北京', value: 113 }, { name: '天津', value: 28 }, { name: '河北', value: 327 },
            { name: '山西', value: 399 }, { name: '内蒙古', value: 169 }, { name: '辽宁', value: 103 },
            { name: '吉林', value: 62 }, { name: '黑龙江', value: 59 }, { name: '上海', value: 19 },
            { name: '江苏', value: 221 }, { name: '浙江', value: 257 }, { name: '安徽', value: 169 },
            { name: '福建', value: 185 }, { name: '江西', value: 136 }, { name: '山东', value: 230 },
            { name: '河南', value: 368 }, { name: '湖北', value: 146 }, { name: '湖南', value: 192 },
            { name: '广东', value: 142 }, { name: '广西', value: 134 }, { name: '海南', value: 15 },
            { name: '重庆', value: 72 }, { name: '四川', value: 230 }, { name: '贵州', value: 110 },
            { name: '云南', value: 178 }, { name: '西藏', value: 70 }, { name: '陕西', value: 293 },
            { name: '甘肃', value: 173 }, { name: '青海', value: 41 }, { name: '宁夏', value: 20 },
            { name: '新疆', value: 113 }, { name: '台湾', value: 10 }, { name: '香港', value: 5 }, { name: '澳门', value: 2 }
          ]
        }]
      };
    },

    // 显示省份地图
async showProvinceMap(provinceName) {
  if (this.currentMapType === 'province' && this.currentProvince === provinceName) return;
  
  // 获取英文文件名
  const fileName = provinceToFile[provinceName];
  if (!fileName) {
    console.error('未找到省份对应的地图文件:', provinceName);
    return;
  }
  
  const sites = this.heritageByProvince.get(provinceName) || [];
  
  // 加载 GeoJSON
  let geoJson = this.provinceGeoCache.get(fileName);
  if (!geoJson) {
    try {
      const response = await fetch(`./assets/maps/province/${fileName}.json`);
      geoJson = await response.json();
      this.provinceGeoCache.set(fileName, geoJson);
    } catch (error) {
      console.error(`加载省份地图失败: ${fileName}.json`, error);
      return;
    }
  }
  
  const mapKey = `province_${fileName}`;
  echarts.registerMap(mapKey, geoJson);
  
  const scatterData = sites.map(site => ({ name: site.name, value: site.value }));
  
  const option = {
    title: { text: `${provinceName}省文物保护单位分布`, left: 'center', textStyle: { color: '#2c3e4e' } },
    tooltip: { trigger: 'item', formatter: (params) => {
      if (params.seriesType === 'scatter') {
        return `${params.name}<br/>经度: ${params.value[0].toFixed(4)}<br/>纬度: ${params.value[1].toFixed(4)}`;
      }
      return params.name;
    } },
    geo: {
      map: mapKey,
      roam: true,
      zoom: 1,
      center: this.getMapCenter(provinceName),
      label: { show: true, fontSize: 12, color: '#2c3e4e' },
      emphasis: { label: { show: true }, itemStyle: { areaColor: '#f39c12' } },
      itemStyle: { borderColor: '#fff', borderWidth: 1 }
    },
    series: [{
      name: '文物保护单位',
      type: 'scatter',
      coordinateSystem: 'geo',
      data: scatterData,
      symbolSize: 8,
      symbol: 'circle',
      itemStyle: { color: '#d32f2f', borderColor: '#fff', borderWidth: 1 },
      label: { show: true, formatter: '{b}', position: 'top', offset: [0, -10], fontSize: 10 },
      emphasis: { scale: true, label: { show: true, fontWeight: 'bold' } }
    }]
  };
  
  this.chinaMapChart.setOption(option, true);
  this.currentMapType = 'province';
  this.currentProvince = provinceName;
},
    
    // 获取各省份地图中心点（粗略经纬度，可根据实际情况调整）
    getMapCenter(provinceName) {
      const centers = {
        '北京': [116.4074, 39.9042], '天津': [117.1902, 39.1256], '上海': [121.4737, 31.2304],
        '重庆': [106.5044, 29.5582], '河北': [114.4995, 38.1006], '山西': [112.5624, 37.8735],
        '辽宁': [123.4315, 41.8057], '吉林': [125.3245, 43.8868], '黑龙江': [126.6424, 45.7567],
        '江苏': [118.7674, 32.0415], '浙江': [120.1536, 30.2875], '安徽': [117.283, 31.8612],
        '福建': [119.3062, 26.0753], '江西': [115.8922, 28.6765], '山东': [117.0009, 36.6758],
        '河南': [113.6654, 34.757], '湖北': [114.2986, 30.5844], '湖南': [112.9823, 28.1941],
        '广东': [113.2644, 23.1291], '海南': [110.349, 20.017], '四川': [104.0657, 30.6595],
        '贵州': [106.7135, 26.5783], '云南': [102.7123, 25.0406], '陕西': [108.948, 34.2632],
        '甘肃': [103.8236, 36.058], '青海': [101.780, 36.620], '台湾': [121.520, 25.030],
        '内蒙古': [111.6708, 40.8183], '广西': [108.320, 22.824], '西藏': [91.1409, 29.656],
        '宁夏': [106.278, 38.466], '新疆': [87.617, 43.793], '香港': [114.173, 22.320],
        '澳门': [113.543, 22.199]
      };
      return centers[provinceName] || [110, 35];
    },
    
    // 返回全国地图
    backToChinaMap() {
      this.chinaMapChart.setOption(this.getChinaMapOption(), true);
      this.currentMapType = 'china';
      this.currentProvince = '';
      // 重新绑定点击事件
      this.chinaMapChart.off('click');
      this.chinaMapChart.on('click', (params) => {
        if (params.componentType === 'series' && params.seriesType === 'map') {
          const provinceName = params.name;
          if (provinceName && provinceName !== '南海诸岛') {
            this.showProvinceMap(provinceName);
          }
        }
      });
    },

    // ==================== 其他图表（保持不变） ====================
    initProvinceBarChart() {
      const chartDom = document.getElementById('province-bar-chart');
      const myChart = echarts.init(chartDom);
      const option = {
        title: { text: '古建筑数量TOP10省份', left: 'center', textStyle: { color: '#2c3e4e' } },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '12%', right: '4%', top: '15%', bottom: '5%', containLabel: true },
        xAxis: { type: 'value', boundaryGap: [0, 0.01] },
        yAxis: {
          type: 'category',
          data: ['福建', '湖南', '江苏', '四川', '山东', '浙江', '陕西', '河北', '河南', '山西'],
          axisLabel: {
            interval: 0   // 关键：显示所有标签
          }
        },
        series: [{
          name: '古建筑数量', type: 'bar',
          data: [185, 192, 221, 230, 230, 257, 293, 327, 368, 399],
          itemStyle: { color: '#628a8a' }
        }]
      };
      myChart.setOption(option);
    },
    
    initDensityHeatmapChart() {
      const chartDom = document.getElementById('density-heatmap-chart');
      this.heatmapChart = echarts.init(chartDom);
      this.heatmapChart.setOption({
        title: { text: '文物密度热力图', left: 'center', textStyle: { color: '#2c3e4e' } },
        tooltip: { position: 'top' },
        // 关键修改：通过 grid 控制绘图区域左右边距，使横坐标单元格变窄
        grid: {
          left: '10%',     // 左侧留白（为 y 轴标签预留空间）
          right: '18%',    // 右侧留白（为 visualMap 颜色条预留空间）
          containLabel: true   // 防止轴标签被裁剪
        },
        xAxis: { type: 'category', data: ['东部', '南部', '西部', '北部'] },
        yAxis: { type: 'category', data: ['高密度区', '中密度区', '低密度区'] },
        visualMap: {
          min: 0, max: 1600, calculable: true,
          left: 'right',        // 将颜色条移到右侧，避免与左侧 y 轴重叠
          inRange: { color: ['#f7fbff', '#abd0e6', '#3787c0', '#0d4b74'] }
        },
        series: [{ type: 'heatmap', data: [[0,0,1535],[1,1,847],[2,0,1046],[3,2,733]], label: { show: true } }]
      });
    },
    
initTypePieChart() {
  const chartDom = document.getElementById('type-pie-chart');
  this.pieChart = echarts.init(chartDom);
  this.pieChart.setOption({
    title: { text: '文物类型分布', left: 'center', textStyle: { color: '#2c3e4e' } },
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', bottom: 'bottom' },
    series: [{
      name: '文物类型', type: 'pie', radius: '60%', data: [
        { value: 2169, name: '古建筑' },
        { value: 1188, name: '古遗址' },
        { value: 420, name: '古墓葬' },
        { value: 313, name: '石窟寺及石刻' },
        { value: 78, name: '其他' }
      ]
    }]
  });

  // 绑定点击事件
  this.pieChart.off('click');
  this.pieChart.on('click', (params) => {
    if (params.componentType === 'series' && params.seriesType === 'pie' && params.data?.name === '古建筑') {
      // 跳转到 public/elliptical-chart/index.html
      window.open('./elliptical-chart/index.html', '_blank');
    }
  });
},
    
    initProtectionLevelChart() {
      const chartDom = document.getElementById('protection-level-chart');
      this.protectionChart = echarts.init(chartDom);
      this.protectionChart.setOption({
        title: { text: '文保单位批次分布', left: 'center', textStyle: { color: '#2c3e4e' } },
        tooltip: { trigger: 'item' },
        legend: { orient: 'horizontal', bottom: 'bottom' },
        series: [{ name: '批次分布', type: 'pie', radius: ['40%', '70%'], data: [
          { value: 127, name: '全国重点' },
          { value: 62, name: '省级' },
          { value: 258, name: '设区的市级' },
          { value: 250, name: '县级' },
          { value: 518, name: '未定级不可移动文物' }
        ] }]
      });
    },
    
initTimeTrendChart() {
  const chartDom = document.getElementById('time-trend-chart');
  // 如果已有实例，先销毁避免冲突
  if (this.timeTrendChart) {
    this.timeTrendChart.dispose();
  }
  this.timeTrendChart = echarts.init(chartDom);
  
  const option = {
    title: { text: '文物年代分布', left: 'center', textStyle: { color: '#2c3e4e' } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        // 调试：在控制台输出 params 结构
        console.log('tooltip params:', params);
        if (params && params[0]) {
          // 确保使用 name 和 value 字段
          return `${params[0].name}<br/>文物数量：${params[0].value}`;
        }
        return '数据加载中...';
      }
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '15%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['史前','夏','商','周','春秋','战国','秦','汉','三国','晋','南北朝','隋','唐','五代','宋','辽','金','元','明','清'],
      axisLabel: {
        interval: 0,
        rotate: 90,
        fontSize: 10,
        margin: 15
      }
    },
    yAxis: { type: 'value', name: '文物数量' },
    series: [{
      name: '文物数量',
      type: 'bar',
      data: [477,30,44,151,34,74,32,244,51,15,51,37,275,39,416,91,127,292,800,704],
      itemStyle: { color: '#628a8a' },
      // 新增：柱顶直接显示数值，避免依赖悬停
      label: {
        show: true,
        position: 'top',
        fontSize: 10,
        formatter: '{c}'
      }
    }]
  };
  
  this.timeTrendChart.setOption(option);
},
    
    handleResize() {
      const charts = [this.chinaMapChart, this.barChart, this.heatmapChart, this.pieChart, this.protectionChart, this.timeTrendChart];
      charts.forEach(chart => chart && chart.resize());
    }
  }
};
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #D6EBE8;
}
.dashboard-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #D6EBE8;
}
.header {
  flex-shrink: 0;
  height: 64px;
  background-color: #628A8A;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.header h1 { font-size: 24px; margin: 0; letter-spacing: 2px; }
.main-content { flex: 1; min-height: 0; display: flex; padding: 12px; gap: 12px; }
.bottom-content { flex-shrink: 0; height: 320px; display: flex; padding: 12px; gap: 12px; }
.right-column { width: 40%; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
.chart-card { background-color: #DDF0EE; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); flex: 1; min-height: 0; overflow: hidden; display: flex; transition: all 0.2s ease; }
.chart-card:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.12); transform: translateY(-2px); }
#china-map-chart, #province-bar-chart, #density-heatmap-chart, #type-pie-chart, #protection-level-chart, #time-trend-chart { width: 100%; height: 100%; flex: 1; min-height: 0; }

/* 省份地图头部样式 */
.map-container { position: relative; flex-direction: column; }
.map-header { position: absolute; top: 10px; left: 10px; z-index: 10; background: rgba(98,138,138,0.9); padding: 6px 12px; border-radius: 20px; color: white; font-size: 14px; display: flex; gap: 12px; align-items: center; backdrop-filter: blur(4px); }
.back-btn { background: #f39c12; border: none; color: white; padding: 4px 12px; border-radius: 16px; cursor: pointer; font-size: 12px; transition: 0.2s; }
.back-btn:hover { background: #e67e22; transform: scale(1.02); }
.current-province { font-weight: bold; }
</style>
