import Link from "next/link";
import { Zap, Shield, BarChart3, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { HomeHero } from "@/components/home-hero";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Hero Section with Form */}
      <HomeHero isAuthenticated={Boolean(user)} />

      {/* Feature Grid - Bento Style */}
      <section className="pb-32 px-4">
        <div className="container mx-auto max-w-5xl">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Speed */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-secondary/40 p-10 hover:bg-secondary/60 transition-colors duration-500">
                 <div className="flex flex-col h-full justify-between gap-8">
                    <div>
                       <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                          <Zap className="w-7 h-7 text-blue-600" />
                       </div>
                       <h3 className="text-3xl font-semibold tracking-tight mb-3">快，无感。</h3>
                       <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                          平均响应时间 <span className="text-foreground font-medium">50ms</span>。
                          无论是通过控制台还是 API，都能在眨眼间完成。
                       </p>
                    </div>
                    <div className="flex items-center text-blue-600 font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                       了解性能架构 <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                 </div>
              </div>

              {/* Feature 2: Analytics */}
              <div className="md:col-span-1 group relative overflow-hidden rounded-[2.5rem] bg-secondary/40 p-10 hover:bg-secondary/60 transition-colors duration-500">
                 <div className="flex flex-col h-full justify-between gap-8">
                    <div>
                       <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                          <BarChart3 className="w-7 h-7 text-purple-600" />
                       </div>
                       <h3 className="text-3xl font-semibold tracking-tight mb-3">洞察。</h3>
                       <p className="text-lg text-muted-foreground leading-relaxed">
                          地理位置、设备来源，一目了然。
                       </p>
                    </div>
                 </div>
              </div>

              {/* Feature 3: Security */}
              <div className="md:col-span-3 group relative overflow-hidden rounded-[2.5rem] bg-secondary/40 p-10 hover:bg-secondary/60 transition-colors duration-500 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                       <Shield className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-semibold tracking-tight mb-3">安全，全球同步。</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                       基于 Supabase 企业级架构，配合全球边缘网络。
                       RLS 行级安全策略，确保您的每一次访问都安全、快速。
                    </p>
                 </div>
                 <div className="hidden md:block w-32 h-32 relative opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500">
                    {/* Abstract Security Visual */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-green-500/20" strokeWidth="1">
                       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                 </div>
              </div>
           </div>
        </div>
      </section>
      
      <footer className="py-12 bg-background border-t border-border/40">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground/60">
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
