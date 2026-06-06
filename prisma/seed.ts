import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10)

  // 清空旧数据
  await prisma.communityComment.deleteMany()
  await prisma.communityPost.deleteMany()
  await prisma.message.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.review.deleteMany()
  await prisma.order.deleteMany()
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()

  // ===== 用户 =====

  // 科技公司
  const techCorp = await prisma.user.create({
    data: {
      email: 'company@test.com', name: '星辰科技', passwordHash, role: 'ENTERPRISE',
      bio: '一家专注于AI和数字化转型的科技公司，经常需要外部人才支持',
      skills: JSON.stringify(['React', 'Python', '设计', '文案']),
      rating: 4.8, completedTasks: 45, walletBalance: 50000,
    },
  })

  // 装修公司
  const renovateCorp = await prisma.user.create({
    data: {
      email: 'renovate@test.com', name: '安心装修', passwordHash, role: 'ENTERPRISE',
      bio: '本地装修公司，承接家装工装项目，需要各类工人合作',
      skills: JSON.stringify(['水电', '木工', '油漆', '贴砖']),
      rating: 4.6, completedTasks: 128, walletBalance: 30000,
    },
  })

  // 打工人
  const worker1 = await prisma.user.create({
    data: {
      email: 'worker@test.com', name: '小明', passwordHash, role: 'WORKER',
      bio: '全栈开发者，5年经验，擅长React/Node.js/Python',
      skills: JSON.stringify(['React', 'Node.js', 'Python', 'TypeScript']),
      rating: 4.9, completedTasks: 128, walletBalance: 8500,
    },
  })

  const worker2 = await prisma.user.create({
    data: {
      email: 'designer@test.com', name: '小红', passwordHash, role: 'WORKER',
      bio: '资深UI/UX设计师，专注B端产品设计',
      skills: JSON.stringify(['UI设计', 'Figma', 'Sketch', '插画']),
      rating: 4.7, completedTasks: 89, walletBalance: 3200,
    },
  })

  // 蓝领工人
  const worker3 = await prisma.user.create({
    data: {
      email: 'laowang@test.com', name: '老王电工', passwordHash, role: 'WORKER',
      bio: '20年电工经验，持证上岗，精通家装电路、维修',
      skills: JSON.stringify(['电工证', '电路维修', '灯具安装', '弱电布线']),
      rating: 4.9, completedTasks: 356, walletBalance: 12000,
    },
  })

  const worker4 = await prisma.user.create({
    data: {
      email: 'liujie@test.com', name: '刘姐保洁', passwordHash, role: 'WORKER',
      bio: '专业保洁10年，认真负责，深得客户好评',
      skills: JSON.stringify(['日常保洁', '深度保洁', '开荒保洁', '擦窗']),
      rating: 4.8, completedTasks: 512, walletBalance: 6800,
    },
  })

  // ===== 任务 =====

  const tasks = [
    // 白领线上任务
    { title: '公司官网首页改版设计', description: '需要重新设计公司官网首页，要求现代化、响应式设计风格。我们是一家AI科技公司，希望突出科技感和专业性。需要提供Figma设计稿和设计规范文档。', budgetMin: 5000, budgetMax: 8000, deadline: new Date('2026-07-15'), category: 'design', skills: JSON.stringify(['UI设计', 'Figma', '网页设计']), userId: techCorp.id, isRemote: true },
    { title: 'React后台管理系统开发', description: '开发一个内部使用的数据分析后台，需要React + TypeScript + Ant Design技术栈。包含用户管理、数据看板、报表导出等功能。详细需求文档可以私信获取。', budgetMin: 15000, budgetMax: 25000, deadline: new Date('2026-07-30'), category: 'dev', skills: JSON.stringify(['React', 'TypeScript', 'Ant Design', 'Node.js']), userId: techCorp.id, isRemote: true },
    { title: '产品说明书翻译（中译英）', description: '将一份约5000字的中文产品说明书翻译成英文。要求：专业、准确、符合技术文档风格。有类似翻译经验者优先。', budgetMin: 1000, budgetMax: 2000, deadline: new Date('2026-06-30'), category: 'translate', skills: JSON.stringify(['英语', '翻译', '技术文档']), userId: techCorp.id, isRemote: true },
    { title: '短视频剪辑（15条）', description: '我们需要为新产品做推广视频，需要剪辑15条15-30秒的短视频。提供原始素材，需要加字幕、背景音乐、转场特效。每条预算200-400。', budgetMin: 3000, budgetMax: 6000, deadline: new Date('2026-07-20'), category: 'video', skills: JSON.stringify(['视频剪辑', 'Premiere', 'AE']), userId: techCorp.id, isRemote: true },
    { title: 'Python数据清洗脚本', description: '需要写一个Python脚本，对CSV格式的销售数据进行清洗和初步分析。数据量约10万行，需要处理缺失值、格式统一、基本统计输出。', budgetMin: 2000, budgetMax: 4000, deadline: new Date('2026-06-25'), category: 'dev', skills: JSON.stringify(['Python', 'Pandas', '数据分析']), userId: techCorp.id, isRemote: true },
    // 保密任务
    { title: '【保密】新APP原型设计', description: '这是一个保密项目。需要为一款还未上线的社交APP设计完整原型。要求签NDA，具体细节确认后沟通。', budgetMin: 8000, budgetMax: 12000, deadline: new Date('2026-08-01'), category: 'design', skills: JSON.stringify(['原型设计', 'Figma', '交互设计']), userId: techCorp.id, isRemote: true, isConfidential: true },
    // 蓝领线下任务
    { title: '三室两厅全屋电路改造', description: '二手房全屋电路改造，需要重新布线、增加插座点位。建筑面积120平。请持证电工，报价包含材料费。', budgetMin: 3000, budgetMax: 6000, deadline: new Date('2026-06-28'), category: 'electrician', skills: JSON.stringify(['电工证', '电路改造', '布线']), userId: renovateCorp.id, isRemote: false, location: '北京市朝阳区', locationDetail: '望京花园3栋' },
    { title: '新房开荒保洁', description: '新房装修完需要做开荒保洁，建筑面积95平。需要清理装修垃圾、擦拭窗户、全屋清洁。急单，越快越好。', budgetMin: 500, budgetMax: 800, deadline: new Date('2026-06-22'), category: 'cleaning', skills: JSON.stringify(['开荒保洁', '擦窗']), userId: renovateCorp.id, isRemote: false, location: '北京市海淀区', locationDetail: '上地佳园5栋' },
    { title: '厨房下水管道疏通', description: '厨房下水道堵了，需要上门疏通。地址在6楼无电梯。希望能尽快安排。', budgetMin: 100, budgetMax: 200, deadline: new Date('2026-06-20'), category: 'plumber', skills: JSON.stringify(['管道疏通', '维修']), userId: renovateCorp.id, isRemote: false, location: '北京市东城区', locationDetail: '和平里小区12号楼' },
    { title: '办公室墙面翻新粉刷', description: '一个50平的办公室需要重新粉刷墙面，要求墙面平整无裂纹。提供涂料。工期2天。', budgetMin: 2000, budgetMax: 3500, deadline: new Date('2026-07-05'), category: 'painting', skills: JSON.stringify(['墙面处理', '粉刷', '刮腻子']), userId: renovateCorp.id, isRemote: false, location: '北京市西城区', locationDetail: '金融街写字楼B座' },
    { title: '周末搬家需要小货车', description: '单间搬家，有床、衣柜、冰箱等大件。从回龙观搬到天通苑，需要一辆小货车+搬运。', budgetMin: 300, budgetMax: 500, deadline: new Date('2026-06-29'), category: 'moving', skills: JSON.stringify(['搬家', '货运', '搬运']), userId: renovateCorp.id, isRemote: false, location: '北京昌平区', locationDetail: '回龙观→天通苑' },
  ]

  for (const task of tasks) {
    await prisma.task.create({ data: task })
  }

  // ===== 社区帖子 =====

  const posts = [
    {
      title: '北京水电工找活，持证上岗',
      content: '本人从事水电工15年，持有电工证、焊工证。擅长家装电路改造、水管安装、维修。服务北京地区，价格公道，欢迎联系。\n\n经验范围：\n- 全屋电路设计改造\n- 水管安装维修\n- 智能家居布线\n- 灯具卫浴安装',
      category: 'blue-collar', userId: worker3.id, likes: 12,
      tags: JSON.stringify(['北京', '电工', '水电工']),
    },
    {
      title: '自由职业三年，我的一些心得分享',
      content: '三年前从公司裸辞开始做自由职业，从最初的焦虑到现在的从容，分享几点心得：\n\n1️⃣ 心态最重要 — 刚开始可能几个月没单子，需要有一定的积蓄支撑\n2️⃣ 多渠道获客 — 不要只依赖一个平台，多平台展示自己\n3️⃣ 口碑就是生命 — 每一个客户都认真对待，转介绍是最优质的客户来源\n4️⃣ 持续学习 — 技术更新很快，保持学习的习惯\n\n大家有什么想问的可以留言交流！',
      category: 'share', userId: worker1.id, likes: 45,
      tags: JSON.stringify(['自由职业', '经验分享', '远程工作']),
    },
    {
      title: '新手做保洁，有什么要注意的吗？',
      content: '我刚开始做家政保洁，想问下各位老师傅：\n1. 需要准备哪些工具？\n2. 第一次去客户家要注意什么？\n3. 怎么报价比较合理？\n希望有经验的朋友指点一下🙏',
      category: 'question', userId: worker4.id, likes: 8,
      tags: JSON.stringify(['保洁', '新手', '家政']),
    },
    {
      title: '建议增加技能认证功能',
      content: '现在平台上的接单方没有资质认证，比如电工证、厨师证这些，企业方不太好判断水平。建议增加一个认证上传功能，上传证书后平台审核，通过后展示认证标识。这样大家接单也更有说服力。',
      category: 'feedback', userId: worker3.id, likes: 23,
      tags: JSON.stringify(['建议', '认证', '信用']),
    },
  ]

  for (const post of posts) {
    await prisma.communityPost.create({ data: post })
  }

  // ===== 评论 =====
  const firstPost = await prisma.communityPost.findFirst({ orderBy: { createdAt: 'asc' } })
  const secondPost = await prisma.communityPost.findFirst({ skip: 1, orderBy: { createdAt: 'asc' } })

  if (firstPost) {
    await prisma.communityComment.create({
      data: { content: '王师傅技术很好，之前合作过，推荐！', postId: firstPost.id, userId: renovateCorp.id },
    })
    await prisma.communityComment.create({
      data: { content: '请问服务通州吗？', postId: firstPost.id, userId: worker4.id },
    })
  }
  if (secondPost) {
    await prisma.communityComment.create({
      data: { content: '说得太好了，我现在就在第二个月焦虑期😅', postId: secondPost.id, userId: worker2.id },
    })
    await prisma.communityComment.create({
      data: { content: '想问下楼主是怎么找到第一个客户的？', postId: secondPost.id, userId: worker3.id },
    })
  }

  console.log('✅ 种子数据已创建')
  console.log('')
  console.log('📧 企业账号:')
  console.log('   company@test.com / 123456 (星辰科技)')
  console.log('   renovate@test.com / 123456 (安心装修)')
  console.log('')
  console.log('📧 打工人账号:')
  console.log('   worker@test.com / 123456 (小明 - 全栈开发)')
  console.log('   designer@test.com / 123456 (小红 - 设计师)')
  console.log('   laowang@test.com / 123456 (老王电工)')
  console.log('   liujie@test.com / 123456 (刘姐保洁)')
  console.log('')
  console.log('📊 统计:')
  const taskCount = await prisma.task.count()
  const postCount = await prisma.communityPost.count()
  console.log(`   ${taskCount} 个任务 (含蓝领+白领+保密)`)
  console.log(`   ${postCount} 个社区帖子`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
