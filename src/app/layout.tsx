import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { ThemeProvider } from "@/lib/theme-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-syne",
})

export const metadata: Metadata = {
  title: "FormTrack | Precision Lead Tracking for Modern Teams",
  description: "Track every lead source with plain English insights. The ultimate SaaS for marketers and sales teams.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script id="theme-switcher" strategy="beforeInteractive">
          {`
            try {
              var theme = localStorage.getItem('formtrack-theme');
              var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (!theme && supportDark)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          `}
        </Script>
      </head>
      <body className="h-full selection:bg-blue-500/30 selection:text-blue-900 dark:selection:text-blue-100">
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
