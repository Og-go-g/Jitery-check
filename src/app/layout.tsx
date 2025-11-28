import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BASE PULSE - Base Network Wallet Statistics',
  description:
    'Get detailed statistics about your Base network wallet: days active, transactions count, and ETH burned on gas. Analyze your on-chain activity on Base.',
  keywords: [
    'Base',
    'Ethereum',
    'wallet',
    'statistics',
    'blockchain',
    'Base network',
    'on-chain',
    'gas',
    'transactions',
  ],
  authors: [{ name: 'BASE PULSE' }],
  openGraph: {
    title: 'BASE PULSE - Base Network Wallet Statistics',
    description: 'Get your Base network wallet statistics',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BASE PULSE',
    description: 'Get your Base network wallet statistics',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
