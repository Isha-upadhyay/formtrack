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
  description: "Stop guessing where your leads come from. Build beautiful forms, embed them anywhere, and get plain-English insights into exactly which campaign drove the conversion.",
  keywords: ["form builder", "lead tracking", "marketing analytics", "UTM tracker", "SaaS forms"],
  authors: [{ name: "FormTrack Team" }],
  openGraph: {
    title: "FormTrack | Precision Lead Tracking",
    description: "Build beautiful forms, embed them anywhere, and get plain-English insights into exactly which campaign drove the conversion.",
    url: "https://formtrack.app",
    siteName: "FormTrack",
    images: [
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "FormTrack Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FormTrack | Precision Lead Tracking",
    description: "Stop guessing where your leads come from. Build beautiful forms and track the exact source of every conversion.",
    images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
