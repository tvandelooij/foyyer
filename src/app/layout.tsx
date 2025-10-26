import { ClerkProvider } from "@/components/clerk-provider";
import React, { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { nlNL } from "@clerk/localizations";
import { neobrutalism } from "@clerk/themes";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
const Header = React.lazy(() =>
  import("@/components/header").then((mod) => ({ default: mod.Header })),
);
const Navbar = React.lazy(() =>
  import("@/components/navbar").then((mod) => ({ default: mod.default })),
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "foyyer",
  description: "Ontdek en plan theater voorstellingen in Nederland.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={nlNL} appearance={{ theme: neobrutalism }}>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased bg-stone-50`}
        >
          <ConvexClientProvider>
            <ConvexQueryCacheProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <div className="flex flex-col min-h-screen md:min-h-screen mobile:min-h-[100dvh] mx-auto w-full max-w-4xl md:px-4 md:w-2/3 bg-stone-50 dark:bg-gray-900 dark:border-gray-700">
                  <Suspense fallback={null}>
                    <Header />
                  </Suspense>
                  <main className="flex-1 min-h-0 overflow-y-auto">
                    {children}
                    <SpeedInsights />
                    <Analytics />
                  </main>
                  <Suspense fallback={null}>
                    <Navbar />
                  </Suspense>
                </div>
              </ThemeProvider>
            </ConvexQueryCacheProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
