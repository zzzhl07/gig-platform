import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatPrice(price: number): string {
  return '¥' + price.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    // === 白领 / 线上 ===
    'dev': '软件开发',
    'design': '设计',
    'writing': '文案写作',
    'translate': '翻译',
    'marketing': '营销推广',
    'data': '数据标注',
    'video': '视频制作',
    'audio': '音频处理',
    'consulting': '咨询顾问',
    'virtual-assist': '在线助理',
    'it-support': 'IT支持',
    'tutoring': '在线辅导',
    // === 蓝领 / 线下 ===
    'cleaning': '家政保洁',
    'repair': '维修安装',
    'moving': '搬家货运',
    'electrician': '电工',
    'plumber': '水暖工',
    'construction': '装修施工',
    'painting': '油漆粉刷',
    'carpentry': '木工',
    'welding': '焊接切割',
    'driver': '司机代驾',
    'delivery': '配送跑腿',
    'security': '保安',
    'gardening': '园艺绿化',
    'beauty': '美容美发',
    'massage': '按摩理疗',
    'catering': '餐饮帮厨',
    'elderly-care': '老人陪护',
    'baby-care': '月嫂育儿',
    'pet-care': '宠物服务',
    'photography': '摄影摄像',
    'event': '活动执行',
    'other': '其他',
  }
  return labels[category] || category
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'dev': '💻', 'design': '🎨', 'writing': '✍️', 'translate': '🌐',
    'marketing': '📢', 'data': '📊', 'video': '🎬', 'audio': '🎧',
    'consulting': '💡', 'virtual-assist': '🤖', 'it-support': '🔧', 'tutoring': '📚',
    'cleaning': '🧹', 'repair': '🔩', 'moving': '📦', 'electrician': '⚡',
    'plumber': '🔧', 'construction': '🏗️', 'painting': '🎨', 'carpentry': '🪚',
    'welding': '🔥', 'driver': '🚗', 'delivery': '🛵', 'security': '🛡️',
    'gardening': '🌿', 'beauty': '💇', 'massage': '💆', 'catering': '🍳',
    'elderly-care': '👴', 'baby-care': '👶', 'pet-care': '🐾', 'photography': '📸',
    'event': '🎪', 'other': '📋',
  }
  return icons[category] || '📋'
}

export const CATEGORIES = [
  // 白领 / 线上工作
  { value: 'dev', label: '软件开发', group: 'white' },
  { value: 'design', label: '设计', group: 'white' },
  { value: 'writing', label: '文案写作', group: 'white' },
  { value: 'translate', label: '翻译', group: 'white' },
  { value: 'marketing', label: '营销推广', group: 'white' },
  { value: 'data', label: '数据标注', group: 'white' },
  { value: 'video', label: '视频制作', group: 'white' },
  { value: 'audio', label: '音频处理', group: 'white' },
  { value: 'consulting', label: '咨询顾问', group: 'white' },
  { value: 'virtual-assist', label: '在线助理', group: 'white' },
  { value: 'it-support', label: 'IT支持', group: 'white' },
  { value: 'tutoring', label: '在线辅导', group: 'white' },
  // 蓝领 / 线下工作
  { value: 'cleaning', label: '家政保洁', group: 'blue' },
  { value: 'repair', label: '维修安装', group: 'blue' },
  { value: 'moving', label: '搬家货运', group: 'blue' },
  { value: 'electrician', label: '电工', group: 'blue' },
  { value: 'plumber', label: '水暖工', group: 'blue' },
  { value: 'construction', label: '装修施工', group: 'blue' },
  { value: 'painting', label: '油漆粉刷', group: 'blue' },
  { value: 'carpentry', label: '木工', group: 'blue' },
  { value: 'welding', label: '焊接切割', group: 'blue' },
  { value: 'driver', label: '司机代驾', group: 'blue' },
  { value: 'delivery', label: '配送跑腿', group: 'blue' },
  { value: 'security', label: '保安', group: 'blue' },
  { value: 'gardening', label: '园艺绿化', group: 'blue' },
  { value: 'beauty', label: '美容美发', group: 'blue' },
  { value: 'massage', label: '按摩理疗', group: 'blue' },
  { value: 'catering', label: '餐饮帮厨', group: 'blue' },
  { value: 'elderly-care', label: '老人陪护', group: 'blue' },
  { value: 'baby-care', label: '月嫂育儿', group: 'blue' },
  { value: 'pet-care', label: '宠物服务', group: 'blue' },
  { value: 'photography', label: '摄影摄像', group: 'blue' },
  { value: 'event', label: '活动执行', group: 'blue' },
  { value: 'other', label: '其他', group: 'both' },
] as const

export const CATEGORY_GROUPS = [
  { value: 'white', label: '💻 线上工作（白领）' },
  { value: 'blue', label: '🔧 线下工作（蓝领）' },
] as const

export const TASK_STATUS_LABELS: Record<string, string> = {
  OPEN: '招募中',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: '待确认',
  ACTIVE: '进行中',
  SUBMITTED: '已交付',
  REVIEWING: '验收中',
  COMPLETED: '已完成',
  DISPUTED: '争议中',
  CANCELLED: '已取消',
}

// 社区
export const COMMUNITY_CATEGORIES = [
  { value: 'general', label: '综合讨论', icon: '💬' },
  { value: 'share', label: '经验分享', icon: '📖' },
  { value: 'question', label: '求助问答', icon: '❓' },
  { value: 'feedback', label: '建议反馈', icon: '💡' },
  { value: 'recruitment', label: '招募合作', icon: '🤝' },
  { value: 'blue-collar', label: '蓝领天地', icon: '🔧' },
  { value: 'freelance', label: '自由职业', icon: '🚀' },
] as const

export function getCommunityCategoryLabel(value: string): string {
  const found = COMMUNITY_CATEGORIES.find(c => c.value === value)
  return found ? `${found.icon} ${found.label}` : value
}

export function getSubCategories(mainCategory: string): string[] {
  const map: Record<string, string[]> = {
    'dev': ['前端开发', '后端开发', '移动端', '小程序', '桌面应用', '游戏开发', 'AI/机器学习', '区块链', '其他'],
    'design': ['UI设计', '平面设计', 'Logo设计', '海报设计', '包装设计', '3D建模', '室内设计', '服装设计', '其他'],
    'cleaning': ['日常保洁', '深度保洁', '开荒保洁', '擦窗', '地毯清洗', '油烟机清洗', '其他'],
    'repair': ['家电维修', '电脑维修', '手机维修', '家具维修', '门窗维修', '管道疏通', '其他'],
    'construction': ['水电改造', '贴砖', '吊顶', '墙面处理', '地板安装', '整体装修', '其他'],
    'electrician': ['电路检修', '灯具安装', '配电箱安装', '弱电布线', '其他'],
    'plumber': ['水管安装', '水龙头更换', '马桶维修', '热水器安装', '下水道疏通', '其他'],
    'driver': ['代驾', '包车', '货运', '搬家运输', '机场接送', '其他'],
    'delivery': ['文件配送', '超市代买', '取送件', '外卖配送', '其他'],
    'beauty': ['美发', '美甲', '美容护理', '化妆', '纹绣', '其他'],
    'baby-care': ['月嫂', '育儿嫂', '催乳', '早教', '其他'],
    'elderly-care': ['老人陪护', '病人护理', '康复理疗', '其他'],
    'marketing': ['新媒体运营', 'SEO优化', '广告投放', '小红书推广', '抖音运营', '其他'],
    'video': ['视频剪辑', '动画制作', '宣传片制作', 'Vlog制作', 'AE特效', '其他'],
    'writing': ['公众号文章', '软文撰写', '商业文案', '论文润色', '演讲稿', '其他'],
    'translate': ['中译英', '英译中', '日语翻译', '韩语翻译', '小语种', '其他'],
  }
  return map[mainCategory] || []
}

export function getCategoryGroup(category: string): string {
  const found = CATEGORIES.find(c => c.value === category)
  return found?.group || 'both'
}
