'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { LinkGrid } from '@/components/link-grid'
import { CreateLinkDialog } from '@/components/create-link-dialog'
import { PageHeader } from '@/components/page-header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LayoutDashboard, Search, Filter, Globe, Lock, BarChart3, ArrowUpDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface LinkItem {
  id: string
  short_code: string
  original_url: string
  visits_count: number
  created_at: string
  is_public: boolean
  description?: string | null
}

export function DashboardClient({ links }: { links: LinkItem[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // all, public, private
  const [sortType, setSortType] = useState('newest') // newest, oldest, most_visits, least_visits
  const deferredQuery = useDeferredValue(searchQuery)

  const normalizedQuery = useMemo(() => deferredQuery.trim().toLowerCase(), [deferredQuery])

  const stats = useMemo(() => {
    let totalVisits = 0
    let publicLinks = 0
    for (const link of links) {
      totalVisits += link.visits_count
      if (link.is_public) publicLinks += 1
    }
    return { totalLinks: links.length, totalVisits, publicLinks }
  }, [links])

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchesSearch =
        !normalizedQuery ||
        link.short_code.toLowerCase().includes(normalizedQuery) ||
        link.original_url.toLowerCase().includes(normalizedQuery) ||
        (link.description && link.description.toLowerCase().includes(normalizedQuery))

      const matchesFilter =
        filterType === 'all' ? true : filterType === 'public' ? link.is_public : !link.is_public

      return matchesSearch && matchesFilter
    })
  }, [filterType, links, normalizedQuery])

  const sortedLinks = useMemo(() => {
    const arr = [...filteredLinks]
    arr.sort((a, b) => {
      switch (sortType) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'most_visits':
          return b.visits_count - a.visits_count
        case 'least_visits':
          return a.visits_count - b.visits_count
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
    return arr
  }, [filteredLinks, sortType])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <PageHeader
        title="控制台"
        description="管理您的短链，查看实时数据分析。"
        gradient
      >
        <Button asChild variant="outline" className="h-10">
          <Link href="/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            统计中心
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Overview - Compact Design */}
      <div className="grid grid-cols-3 divide-x divide-border/40 bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-1 px-2">
           <span className="text-xs sm:text-sm font-medium text-muted-foreground">总链接数</span>
           <div className="flex items-baseline gap-1">
             <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{stats.totalLinks}</span>
           </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-2">
           <span className="text-xs sm:text-sm font-medium text-muted-foreground">总访问量</span>
           <div className="flex items-baseline gap-1">
             <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{stats.totalVisits}</span>
           </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-2">
           <span className="text-xs sm:text-sm font-medium text-muted-foreground">公开链接</span>
           <div className="flex items-baseline gap-1">
             <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{stats.publicLinks}</span>
           </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-xl border backdrop-blur-sm">
        <div className="relative w-full sm:w-72">
          <Label htmlFor="link-search" className="sr-only">
            搜索短链
          </Label>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            id="link-search"
            placeholder="搜索短链..." 
            className="pl-9 bg-background/50 border-primary/10 focus:border-primary/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={sortType} onValueChange={setSortType}>
            <SelectTrigger className="w-full sm:w-40 bg-background/50 border-primary/10">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="排序" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新创建</SelectItem>
              <SelectItem value="oldest">最早创建</SelectItem>
              <SelectItem value="most_visits">访问量最高</SelectItem>
              <SelectItem value="least_visits">访问量最低</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-35 bg-background/50 border-primary/10">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="筛选" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部显示</SelectItem>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> 公开
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> 私有
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!sortedLinks || sortedLinks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 border rounded-3xl border-dashed border-border/60 bg-card/30 backdrop-blur-sm"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <LayoutDashboard className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-medium mb-1">
            {links.length === 0 ? "暂无短链" : "未找到匹配的短链"}
          </h3>
          <p className="text-muted-foreground mb-6 text-center max-w-sm">
            {links.length === 0 
              ? "您还没有创建任何短链。开始创建您的第一个短链，体验极速跳转。" 
              : "尝试调整搜索关键词或筛选条件。"}
          </p>
          {links.length === 0 && <CreateLinkDialog />}
        </motion.div>
      ) : (
        <div className="space-y-4">
           <div className="text-sm text-muted-foreground pl-1">
              显示 {sortedLinks.length} 个短链
           </div>
           <LinkGrid links={sortedLinks} />
        </div>
      )}
    </div>
  )
}
