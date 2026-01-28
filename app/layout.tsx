
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
      <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content="minLink" />
      <link rel="manifest" href="/favicon/site.webmanifest" />
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
