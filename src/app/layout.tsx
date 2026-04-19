import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'FormTrack — Know exactly where every lead comes from',
  description: 'Build embeddable lead forms in minutes. Every submission arrives with a plain-English source explanation. Verify your agency results independently.',
  keywords: 'lead tracking, UTM tracking, form builder, lead generation, India, digital marketing',
  openGraph: {
    title: 'FormTrack — Know where every lead comes from',
    description: 'Stop trusting your agency blindly. See every lead source in plain English.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080A0E]">{children}</body>
    </html>
  )
}