'use client'

import { motion, type Variants } from 'framer-motion'
import { HeroForm } from '@/components/hero-form'

export function HomeHero({ isAuthenticated }: { isAuthenticated: boolean }) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 40, 
        damping: 20,
        duration: 0.8
      } 
    },
  }

  return (
    <section className="relative w-full overflow-hidden pt-32 pb-20 md:pt-48 md:pb-40 flex flex-col items-center justify-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container mx-auto flex flex-col items-center text-center px-4 relative z-10"
      >
        <motion.h1
          variants={item}
          className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tighter text-foreground max-w-5xl leading-[1.05] mb-8"
        >
          链接 化繁为简
        </motion.h1>

        <motion.p
          variants={item}
          className="max-w-2xl text-2xl sm:text-3xl text-muted-foreground leading-normal font-medium mb-16 tracking-tight"
        >
          极速生成、数据可视、企业级安全
        </motion.p>

        <motion.div variants={item} className="w-full flex justify-center">
           <HeroForm isAuthenticated={isAuthenticated} />
        </motion.div>
        
      </motion.div>
    </section>
  )
}
