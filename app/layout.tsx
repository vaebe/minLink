
import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";

const fontHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontBody = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "MinLink - 极简短链工具",
  description: "面向个人用户、开发者和创作者的极简短链生成与管理工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <meta name="apple-mobile-web-app-title" content="minLink" />
      <body
        className={`${fontHeading.variable} ${fontBody.variable} antialiased min-h-screen bg-background font-sans text-foreground`}
      >
        <div className="relative flex min-h-screen flex-col bg-[url('/grid-black.svg')] bg-top bg-repeat dark:bg-[url('/grid.svg')]">
          <SiteHeader />
          <div className="flex-1 pt-16">{children}</div>

          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-150 h-150 rounded-full bg-blue-500/5 blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-125 h-125 rounded-full bg-purple-500/5 blur-[120px]" />
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
