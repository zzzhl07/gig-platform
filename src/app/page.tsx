'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const FEATURES = [
  { icon: '🔒', title: '担保交易', desc: '资金托管到平台，完成验收后自动结算，双方都有保障' },
  { icon: '⭐', title: '信用体系', desc: '完工互评，信用透明。好评越多，接单/发单越容易' },
  { icon: '💬', title: '在线沟通', desc: '内置即时通讯，随时随地沟通需求，文件传输方便' },
  { icon: '🛡️', title: '纠纷仲裁', desc: '出现争议时平台介入，公平公正解决问题' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: '发布需求',
    desc: '企业填写任务详情、预算和截止时间，一键发布到市场',
    role: 'enterprise',
  },
  {
    step: '02',
    title: '匹配接单',
    desc: '打工人浏览任务，申请接单。企业选择合适的候选人',
    role: 'both',
  },
  {
    step: '03',
    title: '执行交付',
    desc: '打工人按需求完成工作并提交成果，企业在线验收',
    role: 'worker',
  },
  {
    step: '04',
    title: '完成结算',
    desc: '确认验收后平台自动放款，双方互评，建立信用记录',
    role: 'both',
  },
]

const STATS = [
  { value: '5,000+', label: '注册用户' },
  { value: '2,000+', label: '已完成任务' },
  { value: '98%', label: '好评率' },
  { value: '¥500K+', label: '累计交易额' },
]

export default function HomePage() {
  return (
    <div>
      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
        <div className="container text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            🚀 让每一份劳动都被尊重
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            企业发单，{' '}
            <span className="text-primary">打工人接单</span>
            <br />
            双向共赢的灵活用工平台
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            企业按需发布任务，打工人自由接单。
            担保交易保障权益，信用体系让合作更放心。
            无论是设计、开发、文案，还是咨询、营销，这里都有你的舞台。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tasks">
              <Button variant="primary" size="lg">浏览任务市场</Button>
            </Link>
            <Link href="/tasks/post">
              <Button variant="outline" size="lg">我要发布任务</Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/3 blur-3xl pointer-events-none" />
      </section>

      {/* ===== Stats Section ===== */}
      <section className="border-y bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">如何运作</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            简单四步，开启高效灵活的用工合作
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="relative">
              <div className="text-5xl font-black text-primary/10 mb-4">{item.step}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
              {item.role === 'enterprise' && (
                <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">企业</span>
              )}
              {item.role === 'worker' && (
                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">打工人</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="bg-muted/30 border-y py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">为什么选择我们</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              平台担保，信用保障，让每一笔合作都安心
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardContent className="pt-6">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="container py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-muted-foreground mb-8">
            无论你是企业寻找灵活人才，还是个人想用技能变现
            <br />打工人集市都是你的最佳选择
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?tab=register">
              <Button variant="primary" size="lg">免费注册</Button>
            </Link>
            <Link href="/tasks">
              <Button variant="outline" size="lg">随便看看</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
