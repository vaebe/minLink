'use client'

import { motion } from 'framer-motion'
import { LinkCard } from '@/components/link-card'

interface LinkItem {
  id: string
  short_code: string
  original_url: string
  visits_count: number
  created_at: string
  is_public: boolean
  description?: string | null
}

export function LinkGrid({ links, readOnly = false }: { links: LinkItem[], readOnly?: boolean }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div 
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {links.map((link) => (
        <LinkCard key={link.id} link={link} readOnly={readOnly} />
      ))}
    </motion.div>
  )
}
