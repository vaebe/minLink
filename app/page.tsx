import Link from "next/link";
import { Zap, Shield, BarChart3, LucideIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { HomeHero } from "@/components/home-hero";
import Image from "next/image";

interface FeatureCardProps {
   icon: LucideIcon;
   title: string;
   description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {

   const desc = description.split('\n').map((line, index) => (
      <span key={index}>
         {line}
         {index < description.split('\n').length - 1 && <br />}
      </span>
   ))

   return (
      <div className="flex flex-col gap-6 items-start group">
         <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-orange-300 transition-colors duration-500">
            <Icon className="w-7 h-7 text-foreground group-hover:text-white transition-colors duration-500" />
         </div>
         <div className="space-y-3">
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
               {desc}
            </p>
         </div>
      </div>
   );
}

function CFooter() {
   return (
      <footer className="py-12 bg-background border-t border-border/40">
         <div className="mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground/60">
            <div className="flex items-center gap-2">
               <span className="font-semibold text-foreground/80">MinLink</span>
               <span>© 2027-1</span>
            </div>
            <div className="flex gap-8">
               <Link href="#" className="hover:text-foreground transition-colors">隐私政策</Link>
               <Link href="#" className="hover:text-foreground transition-colors">服务条款</Link>
               <Link href="https://github.com/vaebe/minLink" target="_blank"
                  className="hover:text-foreground transition-colors flex items-center">
                  <Image src='/icon/github.svg' width={16} height={16} className='mr-2 h-4 w-4' alt='github'></Image>
                  GitHub
               </Link>
            </div>
         </div>
      </footer>
   )
}

export default async function Home() {
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();

   return (
      <main className="flex flex-col min-h-screen text-foreground overflow-x-hidden">
         <HomeHero isAuthenticated={Boolean(user)} />

         <section className="py-24 md:py-32 px-4">
            <div className="mx-auto max-w-6xl">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
                  <FeatureCard
                     icon={Zap}
                     title="快，无感。"
                     description="平均响应时间 50ms。\n无论是通过控制台还是 API，都能在眨眼间完成。"
                  />
                  <FeatureCard
                     icon={BarChart3}
                     title="洞察。"
                     description="精准的访问统计。\n地理位置、设备来源、时间趋势，一目了然。"
                  />
                  <FeatureCard
                     icon={Shield}
                     title="安全。"
                     description="基于 Supabase 企业级架构。\nRLS 行级安全策略，确保您的每一次访问都安全可靠。"
                  />
               </div>
            </div>
         </section>

         <CFooter></CFooter>
      </main>
   );
}
