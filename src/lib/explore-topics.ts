const TOPIC_GROUPS: Record<string, string[]> = {
  科学: ['地球化学', '凝聚态物理', '物理前沿', '概率统计', '高能物理', '地球物理', '放射化学', '常微分方程', '量子力学', '免疫学', '博弈论', '生物物理', '古气候学', '天体化学', '水文学', '有机合成', '纳米技术', '沉积学', '声学原理'],
  艺术: ['现代戏剧', '影像叙事', '展览设计', '视觉传达', '舞台美术', '版画语言', '色彩构成', '城市速写', '数字雕塑', '摄影构图', '声音装置', '戏曲身段', '材料实验', '艺术史论', '装帧设计', '公共艺术'],
  历史: ['晚清变局', '丝路贸易', '城市考古', '帝国财政', '战争动员', '海洋史', '工业革命', '宋代商业', '欧洲宗教改革', '殖民网络', '档案研究', '近代外交', '社会史', '思想史', '技术史'],
  科技: ['人机交互', '机器学习', '分布式系统', '产品架构', '数据可视化', '边缘计算', '芯片设计', '机器人控制', '信息安全', '图数据库', '知识工程', '智能硬件', '接口设计', '系统优化', '云原生'],
  自然: ['火山地貌', '湿地生态', '珊瑚修复', '极地气候', '森林群落', '鸟类迁徙', '岩石循环', '海流系统', '风暴结构', '湖泊演化', '荒漠植物', '冰川尺度', '地貌遥感', '生境修复', '自然教育'],
};

const FALLBACK_DOMAIN = '科学';

export function getExploreTopics(domain: string) {
  return TOPIC_GROUPS[domain] ?? TOPIC_GROUPS[FALLBACK_DOMAIN];
}

export function getExploreTopicBatch(domain: string, cursor: number, count = 10) {
  const topics = getExploreTopics(domain);
  const start = ((cursor % topics.length) + topics.length) % topics.length;

  return Array.from({ length: Math.min(count, topics.length) }, (_, index) => topics[(start + index) % topics.length]);
}
