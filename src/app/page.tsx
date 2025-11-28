import { Metadata } from 'next'
import HomeClient from './page-client'

function getBaseUrl(): string {
  // Check if we're on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Development fallback
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { days?: string; txCount?: string; gas?: string }
}): Promise<Metadata> {
  const days = searchParams?.days
  const txCount = searchParams?.txCount
  const gas = searchParams?.gas

  // If we have parameters, generate dynamic metadata (with validation)
  const validatedDays = Math.max(0, parseInt(days || '0', 10)) || 0
  const validatedTxCount = Math.max(0, parseInt(txCount || '0', 10)) || 0
  const validatedGas = Math.max(0, parseFloat(gas || '0')) || 0

  if (days && txCount && gas && validatedDays > 0 && validatedTxCount > 0) {
    const baseUrl = getBaseUrl()
    const ogImageUrl = `${baseUrl}/api/og?days=${validatedDays}&txCount=${validatedTxCount}&gas=${validatedGas.toFixed(5)}`

    return {
      title: 'My Base Wrapped Stats',
      description: `Check out my onchain activity on Base! ${validatedTxCount.toLocaleString()} Transactions.`,
      openGraph: {
        title: 'My Base Wrapped Stats',
        description: `Check out my onchain activity on Base! ${parseInt(txCount).toLocaleString()} Transactions.`,
        type: 'website',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: 'BASE WRAPPED Stats',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'My Base Wrapped Stats',
        description: `Check out my onchain activity on Base! ${parseInt(txCount).toLocaleString()} Transactions.`,
        images: [ogImageUrl],
      },
    }
  }

  // Default metadata if no parameters
  return {
    title: 'BASE WRAPPED - Base Network Wallet Statistics',
    description:
      'Get detailed statistics about your Base network wallet: days active, transactions count, and ETH burned on gas.',
    openGraph: {
      title: 'BASE WRAPPED - Base Network Wallet Statistics',
      description: 'Get your Base network wallet statistics',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'BASE WRAPPED',
      description: 'Get your Base network wallet statistics',
    },
  }
}

export default function Home({
  searchParams,
}: {
  searchParams: { days?: string; txCount?: string; gas?: string }
}) {
  // Parse initial stats from URL params if present (with validation)
  const days = Math.max(0, parseInt(searchParams?.days || '0', 10)) || 0
  const txCount = Math.max(0, parseInt(searchParams?.txCount || '0', 10)) || 0
  const gas = Math.max(0, parseFloat(searchParams?.gas || '0')) || 0

  const initialStats =
    searchParams?.days && searchParams?.txCount && searchParams?.gas
      ? {
          daysActive: days,
          txCount: txCount,
          gasSpent: gas.toFixed(5),
        }
      : null

  // Build share URL from current params
  const shareUrl = initialStats
    ? `${getBaseUrl()}?days=${initialStats.daysActive}&txCount=${initialStats.txCount}&gas=${initialStats.gasSpent}`
    : undefined

  return <HomeClient initialStats={initialStats} shareUrl={shareUrl} />
}
