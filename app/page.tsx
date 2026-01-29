import Link from "next/link";
import { Zap, Shield, BarChart3 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { HomeHero } from "@/components/home-hero";

export default async function Home() {
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();

   return (
      <main className="flex flex-col min-h-screen text-foreground overflow-x-hidden">
         <HomeHero isAuthenticated={Boolean(user)} />

         <section className="py-24 md:py-32 px-4">
            <div className="mx-auto max-w-6xl">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
                  {/* Feature 1: Speed */}
                  <div className="flex flex-col gap-6 items-start group">
                     <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-orange-300 transition-colors duration-500">
                        <Zap className="w-7 h-7 text-foreground group-hover:text-white transition-colors duration-500" />
                     </div>
                     <div className="space-y-3">
                        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">快，无感。</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                           平均响应时间 <span className="text-foreground font-medium">50ms</span>。
                            <br/>
                           无论是通过控制台还是 API，都能在眨眼间完成。
                        </p>
                     </div>
                  </div>

                  {/* Feature 2: Analytics */}
                  <div className="flex flex-col gap-6 items-start group">
                     <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-orange-300 transition-colors duration-500">
                        <BarChart3 className="w-7 h-7 text-foreground group-hover:text-white transition-colors duration-500" />
                     </div>
                     <div className="space-y-3">
                        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">洞察。</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                           精准的访问统计。
                            <br/>
                           地理位置、设备来源、时间趋势，一目了然。
                        </p>
                     </div>
                  </div>

                  {/* Feature 3: Security */}
                  <div className="flex flex-col gap-6 items-start group">
                     <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-orange-300 transition-colors duration-500">
                        <Shield className="w-7 h-7 text-foreground group-hover:text-white transition-colors duration-500" />
                     </div>
                     <div className="space-y-3">
                        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">安全。</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                           基于 Supabase 企业级架构。
                           <br/>
                           RLS 行级安全策略，确保您的每一次访问都安全可靠。
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         <footer className="py-12 bg-background border-t border-border/40">
            <div className="mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground/60">
               <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground/80">MinLink</span>
                  <span>© {new Date().getFullYear()}</span>
               </div>
               <div className="flex gap-8">
                  <Link href="#" className="hover:text-foreground transition-colors">隐私政策</Link>
                  <Link href="#" className="hover:text-foreground transition-colors">服务条款</Link>
                  <Link href="https://github.com/vaebe/minLink" target="_blank" className="hover:text-foreground transition-colors">GitHub</Link>
               </div>
            </div>
         </footer>
      </main>
   );
}
