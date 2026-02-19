import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProfilePrompt } from "@/components/auth/profile-prompt";
import "./globals.scss";

export const metadata: Metadata = {
  title: "HandyTool",
  description: "HandyTool - Free online tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <Header brandName="HandyTool" />
        {children}
        <Footer brandName="HandyTool" />
        <ProfilePrompt />
      </body>
    </html>
  );
}
