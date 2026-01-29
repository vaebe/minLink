
import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeaderWrapper } from "@/components/site-header-wrapper";

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
        <div className="relative flex min-h-screen flex-col">
          <SiteHeaderWrapper />
          <div className="flex-1 pt-16">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
