export const overviewStats = [
  { label: '国保样本', value: '439', note: '来自本地全国重点文物保护单位试用数据' },
  { label: '资质单位', value: '199', note: '来自本地中国文物保护工程资质单位信息表' },
  { label: '资格人员', value: '827', note: '来自本地中国文物保护工程资格人员信息表' },
  ]

export const featuredSites = [
  {
    name: '应县木塔',
    region: '山西朔州',
    dynasty: '辽代',
    type: '木塔建筑',
    heat: 94,
    highlight: '高层木构建筑的结构监测和风险预警价值非常突出。',
    tags: ['结构变形', '木构监测', '预警分析'],
    detail: {
      title: '应县木塔保护现状',
      subtitle: '高耸木构建筑的风险预警重点对象',
      summary: '应县木塔最值得关注的是结构位移、节点变形、材料疲劳和环境影响累积，属于典型的高风险精细监测对象。',
      tags: ['高层木构', '风险预警', '结构病害'],
      facts: [
        { label: '保存状态', value: '重点保护，长期监测' },
        { label: '主要病害', value: '开裂、倾斜、节点松动、风雨侵蚀' },
        { label: '保护重点', value: '结构安全评估与长期位移跟踪' }
      ],
      highlights: [
        '高层木构的风险管理比普通古建更依赖连续监测数据。',
        '保护决策通常要把结构安全、游客承载与环境因素一起考虑。'
      ]
    }
  },
  {
    name: '云冈石窟',
    region: '山西大同',
    dynasty: '北魏',
    type: '石窟寺石刻',
    heat: 91,
    highlight: '风化、渗水和微环境变化是石窟寺保护的核心议题。',
    tags: ['风化病害', '微环境', '石窟监测'],
    detail: {
      title: '云冈石窟保护现状',
      subtitle: '石窟寺与石刻类遗产的环境保护样本',
      summary: '石窟类遗产的保护重点是风化、裂隙扩展、水盐侵蚀和游客环境干扰，需要环境监测和病害识别共同支撑。',
      tags: ['石窟寺', '风化', '环境监测'],
      facts: [
        { label: '保存状态', value: '重点监测与分区修复并行' },
        { label: '主要病害', value: '风化、开裂、渗水、表面剥蚀' },
        { label: '数字化工作', value: '高精度采集、表面病害记录、三维比对' }
      ],
      highlights: [
        '石窟类保护特别强调环境变化与病害演化之间的关系。',
        '数字表面模型非常适合做病害扩展的时间比对。'
      ]
    }
  },
  {
    name: '平遥古城',
    region: '山西',
    dynasty: '明清',
    type: '古城街区',
    heat: 88,
    highlight: '古城保护不只看单体建筑，还要看街区连续性和活化压力。',
    tags: ['街区保护', '活化利用', '风险分布'],
    detail: {
      title: '平遥古城保护现状',
      subtitle: '古城街区整体保护的典型场景',
      summary: '古城类保护对象既涉及单体建筑病害，也涉及街巷风貌、旅游压力、消防风险和整体更新控制。',
      tags: ['古城', '街区连续性', '活化管理'],
      facts: [
        { label: '保存状态', value: '整体保存较好，局部存在更新压力' },
        { label: '主要病害', value: '墙体开裂、屋面渗漏、人为改造干扰' },
        { label: '保护重点', value: '风貌控制、消防预警、街区级监测' }
      ],
      highlights: [
        '古城保护的难点在于“整体性”，不是只修几栋重点建筑。',
        '风险预警通常要落到街区尺度，而不是单点尺度。'
      ]
    }
  },
  {
    name: '拙政园',
    region: '江苏苏州',
    dynasty: '明代',
    type: '园林建筑',
    heat: 86,
    highlight: '水体、植物、建筑和游览压力共同影响园林遗产状态。',
    tags: ['园林维护', '潮湿环境', '构件老化'],
    detail: {
      title: '拙政园保护现状',
      subtitle: '园林类遗产的环境协同保护样本',
      summary: '园林保护既涉及建筑本体，也涉及水体湿度、植物遮蔽、游线承载和景观完整性，是多要素协同保护对象。',
      tags: ['园林', '环境协同', '日常维护'],
      facts: [
        { label: '保存状态', value: '整体良好，维护频率高' },
        { label: '主要病害', value: '木构老化、潮湿侵蚀、局部漏水' },
        { label: '数字化工作', value: '园林测绘、场景建模、游客流线分析' }
      ],
      highlights: [
        '园林遗产常常更依赖精细维护，而不只是大型修缮。',
        '数字化能够帮助管理建筑与景观之间的联动关系。'
      ]
    }
  },
  {
    name: '陈家祠',
    region: '广东广州',
    dynasty: '清代',
    type: '宗祠建筑',
    heat: 82,
    highlight: '潮湿气候下的装饰构件病害识别和材料维护尤为关键。',
    tags: ['岭南气候', '装饰病害', '材料维护'],
    detail: {
      title: '陈家祠保护现状',
      subtitle: '岭南装饰密集型建筑的保护样本',
      summary: '在湿热环境中，陈家祠这类建筑要同时面对木构老化、灰塑风化、彩饰污染与游客磨损等复合问题。',
      tags: ['岭南建筑', '装饰工艺', '材料病害'],
      facts: [
        { label: '保存状态', value: '局部构件需周期性修护' },
        { label: '主要病害', value: '腐朽、风化、表面污染、人为磨损' },
        { label: '保护重点', value: '构件精修、微环境维护、展示管理' }
      ],
      highlights: [
        '岭南建筑的维护频率往往高于北方干燥地区。',
        '高装饰密度建筑更适合做病害精细化分级展示。'
      ]
    }
  }
]

export const radarIndicators = ['病害风险', '环境压力', '监测覆盖', '数字化程度', '修缮需求']

export const schoolProfiles = [
  {
    name: '木构古建筑',
    score: [92, 74, 82, 80, 88],
    detail: {
      title: '木构古建筑保护雷达',
      subtitle: '梁架、屋面与节点监测最关键',
      summary: '木构建筑最需要关注的是结构变形、节点松动、屋面渗漏与材料老化，因此监测覆盖和修缮需求通常都较高。',
      tags: ['木构', '结构监测', '修缮需求'],
      facts: [
        { label: '高风险项', value: '开裂、变形、漏水、腐朽' },
        { label: '保护方式', value: '日常巡检 + 节点监测 + 分阶段修缮' }
      ],
      highlights: [
        '木构建筑的风险不是一次性出现，而是长期累积。',
        '监测和修缮必须联动，单做展示无法解决根本问题。'
      ]
    }
  },
  {
    name: '石窟寺石刻',
    score: [95, 90, 78, 76, 84],
    detail: {
      title: '石窟寺石刻保护雷达',
      subtitle: '风化和环境压力最突出',
      summary: '石窟与石刻类遗产极易受到风化、水盐侵蚀和微环境变化影响，因此环境压力和病害风险都偏高。',
      tags: ['石窟寺', '风化', '环境压力'],
      facts: [
        { label: '高风险项', value: '风化、裂隙、渗水、表层剥落' },
        { label: '保护方式', value: '环境监测 + 表面采集 + 病害比对' }
      ],
      highlights: [
        '石窟保护比普通建筑更依赖环境数据。',
        '三维采集非常适合追踪病害扩展速度。'
      ]
    }
  },
  {
    name: '古城街区',
    score: [78, 83, 69, 72, 86],
    detail: {
      title: '古城街区保护雷达',
      subtitle: '整体风貌和人类活动压力并重',
      summary: '古城街区面临的难题不只是单体建筑病害，还包括风貌管控、消防安全、活化利用与人流干扰。',
      tags: ['街区保护', '消防风险', '风貌控制'],
      facts: [
        { label: '高风险项', value: '人为改造、局部破损、业态挤压' },
        { label: '保护方式', value: '街区监测 + 更新控制 + 分区预警' }
      ],
      highlights: [
        '古城保护是区域治理，不是单体修缮。',
        '风险预警通常需要街区级空间分布图。'
      ]
    }
  },
  {
    name: '园林建筑',
    score: [69, 80, 73, 81, 74],
    detail: {
      title: '园林建筑保护雷达',
      subtitle: '湿度、水体和景观协同影响显著',
      summary: '园林类遗产的保护核心是建筑、植物、水体与游览系统之间的协同维护，因此数字化和维护密度都较高。',
      tags: ['园林', '湿度', '景观协同'],
      facts: [
        { label: '高风险项', value: '潮湿侵蚀、木构老化、游览磨损' },
        { label: '保护方式', value: '环境维护 + 日常修护 + 游线管理' }
      ],
      highlights: [
        '园林遗产强调持续维护，不一定每次都是大修。',
        '数字化可以帮助理解园林空间和建筑构件的关系。'
      ]
    }
  },
  {
    name: '近现代建筑',
    score: [71, 66, 62, 70, 68],
    detail: {
      title: '近现代建筑保护雷达',
      subtitle: '材料老化与功能转变问题明显',
      summary: '近现代重要史迹及代表性建筑通常面临材料老化、使用功能改变和修缮标准适配等问题。',
      tags: ['近现代建筑', '材料老化', '功能适配'],
      facts: [
        { label: '高风险项', value: '表层风化、材料疲劳、功能改造干扰' },
        { label: '保护方式', value: '材料诊断 + 活化约束 + 分级修缮' }
      ],
      highlights: [
        '这类建筑的保护常常和使用更新强相关。',
        '既要维持真实性，也要处理现实使用需求。'
      ]
    }
  }
]

export const radarSeriesData = Object.fromEntries(schoolProfiles.map((profile) => [profile.name, profile.score]))
export const schoolDetailsByName = Object.fromEntries(schoolProfiles.map((profile) => [profile.name, profile.detail]))

export const popularityData = [
  { name: '国保', value: 439 },
  { name: '省保', value: 1280 },
  { name: '市保', value: 3620 },
  { name: '县保', value: 10500 }
]


export const fundingMetrics = {
  total: '12.6 亿元',
  annualAverage: '2.1 亿元',
  siteAverage: '287 万元/处',
  gap: '3.8 亿元'
}

export const digitalProgressMetrics = [
  { label: '已三维扫描', value: 68, width: '68%' },
  { label: '已建模', value: 55, width: '55%' },
  { label: '已全景采集', value: 41, width: '41%' }
]

export const monitoringMetrics = {
  totalPoints: 1268,
  highRiskPoints: 214,
  coverageRate: 73,
  byType: [
    { label: '开裂高风险点', value: 82, width: '82%' },
    { label: '漏水高风险点', value: 63, width: '63%' },
    { label: '风化高风险点', value: 41, width: '41%' },
    { label: '腐朽高风险点', value: 28, width: '28%' }
  ]
}

export const diseaseSeverityRanking = [
  { name: '开裂', score: 92, note: '结构与节点风险最高' },
  { name: '漏水', score: 88, note: '最容易诱发连锁病害' },
  { name: '腐朽', score: 80, note: '对木构承载影响明显' },
  { name: '风化', score: 76, note: '石质与表层退化持续累积' },
  { name: '人为破坏', score: 61, note: '景区与街区干扰较突出' }
]

export const levelComparisonMetrics = [
  { label: '国保修缮及时率', value: 72, width: '72%' },
  { label: '省保修缮及时率', value: 64, width: '64%' },
  { label: '市保修缮及时率', value: 53, width: '53%' },
  { label: '县保修缮及时率', value: 41, width: '41%' }
]
export const siteDetailsByName = Object.fromEntries(featuredSites.map((site) => [site.name, site.detail]))

export const glossaryTopics = [
  {
    name: '开裂',
    value: 91,
    detail: {
      title: '开裂病害',
      subtitle: '结构与围护体系中最常见的早期征兆之一',
      summary: '开裂通常意味着材料应力、结构变形或基础变化已经开始积累，是古建筑风险识别中的高频病害。',
      tags: ['裂缝', '结构预警', '病害识别'],
      facts: [
        { label: '常见位置', value: '墙体、梁架节点、地基过渡部位' },
        { label: '风险意义', value: '可能关联变形、荷载变化或环境扰动' }
      ],
      highlights: [
        '开裂是病害识别中最适合做早期预警的一类信号。',
        '裂缝宽度与扩展速度都值得进入监测体系。'
      ]
    }
  },
  {
    name: '腐朽',
    value: 82,
    detail: {
      title: '腐朽病害',
      subtitle: '木构建筑材料劣化的核心问题之一',
      summary: '腐朽多与长期受潮、通风不足和材料老化相关，在木构建筑中尤其需要持续检测。',
      tags: ['木构', '材料劣化', '潮湿环境'],
      facts: [
        { label: '常见位置', value: '柱脚、梁端、檩条、门窗构件' },
        { label: '风险意义', value: '会削弱构件承载力和整体稳定性' }
      ],
      highlights: [
        '腐朽常常和漏水、积湿一起出现。',
        '如果不做及时干预，局部病害会向结构层面传导。'
      ]
    }
  },
  {
    name: '风化',
    value: 88,
    detail: {
      title: '风化病害',
      subtitle: '石刻、石窟和裸露构件中最常见的表层退化现象',
      summary: '风化病害受温湿变化、雨水冲刷、盐分迁移和空气污染影响，在石窟寺与石刻遗产中尤为突出。',
      tags: ['石质遗产', '表层退化', '环境影响'],
      facts: [
        { label: '常见位置', value: '石刻表面、雕饰细部、外露构件' },
        { label: '风险意义', value: '会导致表面剥蚀和纹饰模糊' }
      ],
      highlights: [
        '风化是石质遗产保护中的长期核心议题。',
        '高精度表面模型能很好地追踪风化演变。'
      ]
    }
  },
  {
    name: '漏水',
    value: 79,
    detail: {
      title: '漏水病害',
      subtitle: '屋面和围护系统失效后最直接的表现',
      summary: '漏水会进一步引发木构腐朽、彩画剥落、墙体潮湿和装饰层病害，是古建筑维护中最需要快速响应的问题之一。',
      tags: ['屋面病害', '潮湿侵蚀', '维护响应'],
      facts: [
        { label: '常见位置', value: '屋脊、檐口、天沟、节点搭接处' },
        { label: '风险意义', value: '会诱发连锁性材料病害' }
      ],
      highlights: [
        '漏水本身可能不致命，但它带来的连锁后果往往更严重。',
        '因此屋面巡检通常是古建筑日常维护的核心工作。'
      ]
    }
  },
  {
    name: '人为破坏',
    value: 67,
    detail: {
      title: '人为破坏风险',
      subtitle: '活化利用和游客活动带来的现实压力',
      summary: '人为破坏既包括无序改造，也包括高频接触、踩踏、涂刻和不当利用，是保护管理中的现实风险。',
      tags: ['游客压力', '不当利用', '管理风险'],
      facts: [
        { label: '常见场景', value: '古城街区、热门景区、开放展示建筑' },
        { label: '风险意义', value: '会破坏真实性并加速材料损耗' }
      ],
      highlights: [
        '这类风险往往不是技术问题，而是管理问题。',
        '空间分布图和热点图非常适合展示人为破坏压力。'
      ]
    }
  }
]

export const wordCloudData = glossaryTopics.map(({ name, value }) => ({ name, value }))
export const glossaryDetailsByName = Object.fromEntries(glossaryTopics.map((topic) => [topic.name, topic.detail]))

export const relationshipGraphData = {
  nodes: [
    { name: '监测点位', category: 0, symbolSize: 50, value: 92 },
    { name: '病害识别', category: 0, symbolSize: 42, value: 88 },
    { name: '风险预警', category: 0, symbolSize: 48, value: 90 },
    { name: '三维建模', category: 0, symbolSize: 40, value: 84 },
    { name: '开裂', category: 1, symbolSize: 30, value: 81 },
    { name: '风化', category: 1, symbolSize: 32, value: 83 },
    { name: '漏水', category: 1, symbolSize: 28, value: 76 },
    { name: '修缮计划', category: 2, symbolSize: 36, value: 79 },
    { name: '环境监测', category: 2, symbolSize: 38, value: 85 },
    { name: '数字档案', category: 3, symbolSize: 34, value: 80 }
  ],
  links: [
    { source: '监测点位', target: '风险预警' },
    { source: '病害识别', target: '开裂' },
    { source: '病害识别', target: '风化' },
    { source: '病害识别', target: '漏水' },
    { source: '风险预警', target: '修缮计划' },
    { source: '环境监测', target: '风化' },
    { source: '环境监测', target: '漏水' },
    { source: '三维建模', target: '数字档案' },
    { source: '三维建模', target: '风险预警' },
    { source: '监测点位', target: '环境监测' }
  ],
  categories: [
    { name: '保护环节' },
    { name: '病害类型' },
    { name: '管理动作' },
    { name: '数字化成果' }
  ]
}

export const networkDetailsByName = {
  监测点位: {
    title: '监测点位布局',
    subtitle: '保护现状可视化中的关键基础层',
    summary: '监测点位决定了古建筑状态是否能够被持续感知，也是风险预警、病害识别和修缮判断的前提。',
    tags: ['监测布点', '传感采集', '基础数据'],
    facts: [
      { label: '展示适合', value: '点位图、热力图、分级地图' },
      { label: '关联内容', value: '温湿度、位移、裂缝、漏水等监测项' }
    ],
    highlights: [
      '没有监测点位，就很难做真实的风险预警分布。',
      '点位布局最适合和病害热点一起显示。'
    ]
  },
  病害识别: glossaryDetailsByName.开裂,
  风险预警: {
    title: '风险预警分布',
    subtitle: '从病害识别走向管理决策的核心环节',
    summary: '风险预警把病害、环境、结构和使用压力转成管理信号，是保护与现状类专题中最具现实意义的一层。',
    tags: ['预警分布', '风险等级', '管理决策'],
    facts: [
      { label: '展示适合', value: '预警图、分布图、雷达图' },
      { label: '核心任务', value: '把监测数据转成分级响应建议' }
    ],
    highlights: [
      '风险预警不是单独的图，而是整个保护流程的结果。',
      '最适合与病害类型和监测点位一起联动展示。'
    ]
  },
  三维建模: {
    title: '三维建模进度',
    subtitle: '数字化保护从采集走向分析的中间层',
    summary: '三维建模让古建筑从平面档案走向可量测、可比对、可复核的数字对象，是数字化保护的重要节点。',
    tags: ['三维模型', '数字建档', '空间比对'],
    facts: [
      { label: '展示适合', value: '进度图、阶段图、对比图' },
      { label: '保护价值', value: '支撑病害复核、方案推演和成果留档' }
    ],
    highlights: [
      '三维建模不是终点，它是后续分析和维护的基础。',
      '最适合放在数字化进度和修缮管理之间解释。'
    ]
  },
  开裂: glossaryDetailsByName.开裂,
  风化: glossaryDetailsByName.风化,
  漏水: glossaryDetailsByName.漏水,
  修缮计划: {
    title: '修缮计划与投入',
    subtitle: '从风险识别走向实际干预的管理层',
    summary: '保护专题不仅要显示病害，还要显示修缮计划、资源投入与优先级排序，这样才具备现实管理意义。',
    tags: ['修缮计划', '投入分配', '优先级'],
    facts: [
      { label: '展示适合', value: '对比图、阶段图、投入趋势图' },
      { label: '管理重点', value: '高风险对象优先、重点部位先行' }
    ],
    highlights: [
      '修缮投入是保护专题里最容易和现实决策对接的一层。',
      '图上如果能体现轻重缓急，会非常有说服力。'
    ]
  },
  环境监测: {
    title: '环境监测',
    subtitle: '连接病害、材料和微气候的重要数据层',
    summary: '环境监测用于解释温湿变化、渗水、风化和材料老化之间的关系，是病害研判的重要支撑。',
    tags: ['温湿度', '微环境', '监测数据'],
    facts: [
      { label: '展示适合', value: '折线图、分布图、热力图' },
      { label: '关联病害', value: '风化、漏水、腐朽、表层剥蚀' }
    ],
    highlights: [
      '环境监测是预防性保护最典型的数据来源。',
      '它特别适合和石窟寺、园林、木构建筑一起展示。'
    ]
  },
  数字档案: {
    title: '数字档案建档',
    subtitle: '让古建筑保护进入长期可追踪状态',
    summary: '数字档案把测绘、扫描、模型、照片和监测信息统一起来，是保护状态持续更新的基础。',
    tags: ['数字建档', '档案管理', '长期追踪'],
    facts: [
      { label: '展示适合', value: '阶段图、比例图、进度图' },
      { label: '保护价值', value: '支持后续修缮、研究和公开展示' }
    ],
    highlights: [
      '数字档案是数字化进度中最适合直接展示给公众的一层。',
      '它把保护工作从一次性项目变成可连续更新的过程。'
    ]
  }
}

export const evolutionLineData = {
  periods: ['2020', '2021', '2022', '2023', '2024', '2025'],
  scan: [22, 29, 38, 49, 59, 68],
  model: [12, 17, 24, 34, 45, 55],
  panorama: [8, 12, 18, 26, 33, 41]
}

export const functionDetailsByName = {
  三维扫描率: {
    title: '三维扫描覆盖率',
    subtitle: '数字化保护的起点环节',
    summary: '三维扫描覆盖率反映了保护对象从无空间数据到具备基础数字底座的推进程度。',
    tags: ['数字化进度', '三维扫描', '基础采集'],
    facts: [
      { label: '阶段定位', value: '数字化保护起点' },
      { label: '单位口径', value: '覆盖率（%）' }
    ],
    highlights: [
      '扫描完成并不等于建模完成，但它是最关键的第一步。',
      '非常适合和建模、全景采集做阶段性对比。'
    ]
  },
  三维建模率: {
    title: '三维建模覆盖率',
    subtitle: '从采集走向分析的关键比例指标',
    summary: '建模覆盖率反映扫描成果是否进一步转化为可量测、可比对、可复核的数字模型。',
    tags: ['三维建模', '覆盖率', '数字分析'],
    facts: [
      { label: '阶段定位', value: '数字分析中段' },
      { label: '单位口径', value: '覆盖率（%）' }
    ],
    highlights: [
      '建模比例越高，越适合做病害复核与修缮推演。',
      '它是从采集走向分析能力的关键环节。'
    ]
  },
  全景采集率: {
    title: '全景采集覆盖率',
    subtitle: '面向展示与巡检留档的补充数字化层',
    summary: '全景采集覆盖率反映场景级记录和展示级档案的建设情况，适合与扫描、建模一起比较。',
    tags: ['全景采集', '展示档案', '覆盖率'],
    facts: [
      { label: '阶段定位', value: '展示与档案补充层' },
      { label: '单位口径', value: '覆盖率（%）' }
    ],
    highlights: [
      '全景采集更适合做展示、巡检和长期留档。',
      '它通常推进速度慢于扫描和建模。'
    ]
  }
}

export const timelineMoments = [
  {
    period: '保护层级',
    title: '国保、省保、市保、县保结构对比',
    text: '通过层级结构图可以快速说明保护对象的分层差异和资源分配压力。'
  },
  {
    period: '保存现状',
    title: '完好、一般、破损、濒危状态分布',
    text: '保存现状最适合用比例图或雷达图表达，是保护现状专题的核心基础层。'
  },
  {
    period: '病害类型',
    title: '开裂、腐朽、风化、漏水与人为破坏',
    text: '病害类型可用词云、预警图和关联网络表达，便于连接风险预警与修缮计划。'
  },
  {
    period: '数字化与预警',
    title: '从扫描建档到风险响应',
    text: '数字化进度、监测点位与风险预警是最具现实管理意义的可视化层。'
  }
]

export const ratingPieData = [
  { name: '完好', value: 42 },
  { name: '一般', value: 31 },
  { name: '破损', value: 19 },
  { name: '濒危', value: 8 }
]

export const preservationDetailsByName = {
  完好: {
    title: '完好状态比例',
    subtitle: '保存现状中最稳定的对象群',
    summary: '完好对象通常意味着结构安全、环境影响可控、维护频次稳定，是预防性保护持续跟进的重点样本。',
    tags: ['完好', '预防性保护', '常态监测'],
    facts: [
      { label: '保护重点', value: '保持稳定状态，防止向一般状态滑移' }
    ],
    highlights: [
      '完好并不等于不用管，而是最适合持续监测的对象。',
      '这类对象能体现预防性保护的价值。'
    ]
  },
  一般: {
    title: '一般状态比例',
    subtitle: '需要持续维护但尚未进入高风险区',
    summary: '一般状态对象通常存在局部病害或维护压力，是最适合安排周期性干预和数字建档补强的对象。',
    tags: ['一般状态', '维护干预', '跟踪管理'],
    facts: [
      { label: '保护重点', value: '局部修护、监测补点、状态跟踪' }
    ],
    highlights: [
      '一般状态对象数量往往最多，最考验管理策略。',
      '如果响应不及时，它们最容易向破损状态转化。'
    ]
  },
  破损: {
    title: '破损状态比例',
    subtitle: '需要尽快进入修缮计划与风险评估',
    summary: '破损对象已经出现明显病害累积，适合通过病害分布、修缮优先级和投入趋势图来展示。',
    tags: ['破损', '修缮计划', '优先级排序'],
    facts: [
      { label: '保护重点', value: '病害诊断、优先级排序、修缮干预' }
    ],
    highlights: [
      '破损状态对象最适合和修缮投入一起联动可视化。',
      '它们也是风险预警图中的重点高亮区域。'
    ]
  },
  濒危: {
    title: '濒危状态比例',
    subtitle: '保护现状中最需要预警响应的对象',
    summary: '濒危对象代表结构、环境或人为压力已经接近阈值，需要高频监测和快速响应。',
    tags: ['濒危', '风险预警', '高频监测'],
    facts: [
      { label: '保护重点', value: '高频监测、抢险加固、快速响应' }
    ],
    highlights: [
      '濒危状态最适合做预警分布图和重点名单展示。',
      '它们最能体现保护管理的现实紧迫性。'
    ]
  }
}

export const defaultDetail = featuredSites[0].detail



