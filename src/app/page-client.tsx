'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { getWalletStats } from './actions'
import { isValidEthereumAddress, getAddressValidationError } from '../lib/validation'
import { EXAMPLE_ADDRESSES, RATE_LIMIT_MS } from '../lib/constants'

interface HomeClientProps {
  initialStats?: {
    daysActive: number
    txCount: number
    gasSpent: string
  } | null
  shareUrl?: string
}

export default function HomeClient({ initialStats = null, shareUrl }: HomeClientProps) {
  const [address, setAddress] = useState('')
  const [addressError, setAddressError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    daysActive: number
    txCount: number
    gasSpent: string
  } | null>(initialStats)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [currentShareUrl, setCurrentShareUrl] = useState<string>(shareUrl || '')
  const lastRequestRef = useRef<number>(0)

  // Initialize imageUrl and shareUrl from initialStats if present
  useEffect(() => {
    if (initialStats) {
      const ogParams = new URLSearchParams({
        days: initialStats.daysActive.toString(),
        txCount: initialStats.txCount.toString(),
        gas: initialStats.gasSpent,
      })
      setImageUrl(`/api/og?${ogParams.toString()}&v=2`)
      if (shareUrl) {
        setCurrentShareUrl(shareUrl)
      } else {
        const newShareUrl = `${window.location.origin}${window.location.pathname}?${ogParams.toString()}`
        setCurrentShareUrl(newShareUrl)
      }
    }
  }, [initialStats, shareUrl])

  // Validate address in real-time
  useEffect(() => {
    const error = getAddressValidationError(address)
    setAddressError(error)
  }, [address])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = address.trim()

      if (!trimmed) {
        setError('Please enter a valid address')
        return
      }

      if (!isValidEthereumAddress(trimmed)) {
        setError('Invalid Ethereum address format')
        return
      }

      // Rate limiting: prevent requests faster than configured limit
      const now = Date.now()
      if (now - lastRequestRef.current < RATE_LIMIT_MS) {
        setError('Please wait a moment before requesting again')
        return
      }
      lastRequestRef.current = now

      // Prevent duplicate requests
      if (isPending) {
        return
      }

      setIsPending(true)
      setError(null)
      setStats(null)
      setImageUrl(null)

      try {
        const result = await getWalletStats(trimmed)
        setStats(result)

        // Update share URL with current page URL + params
        const shareParams = new URLSearchParams({
          days: result.daysActive.toString(),
          txCount: result.txCount.toString(),
          gas: result.gasSpent,
        })
        const newShareUrl = `${window.location.origin}${window.location.pathname}?${shareParams.toString()}`
        setCurrentShareUrl(newShareUrl)

        const ogParams = new URLSearchParams({
          days: result.daysActive.toString(),
          txCount: result.txCount.toString(),
          gas: result.gasSpent,
        })
        setImageUrl(`/api/og?${ogParams.toString()}&v=2`)
      } catch (err) {
        setError('Failed to fetch wallet stats. Please try again.')
        console.error(err)
      } finally {
        setIsPending(false)
      }
    },
    [address, isPending]
  )

  const handleShare = () => {
    if (currentShareUrl) {
      const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentShareUrl)}&text=${encodeURIComponent('Check out my Base Pulse stats!')}`
      window.open(twitterUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 animate-pulse">
            BASE PULSE
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" />
          <p className="mt-4 text-green-500/70 text-sm">
            Get your Base network wallet statistics
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className={`w-full px-6 py-4 bg-gray-900 border-2 rounded-lg text-green-400 placeholder-green-500/50 focus:outline-none transition-all duration-300 ${
                addressError
                  ? 'border-red-500 focus:border-red-400 focus:shadow-[0_0_20px_rgba(255,0,0,0.3)]'
                  : isValidEthereumAddress(address) && address
                  ? 'border-green-500 focus:border-green-400 focus:shadow-[0_0_20px_rgba(0,255,0,0.3)]'
                  : 'border-green-500/50 focus:border-green-400 focus:shadow-[0_0_20px_rgba(0,255,0,0.3)]'
              }`}
              disabled={isPending}
              autoComplete="off"
              spellCheck="false"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
          </div>

          {/* Real-time validation message */}
          {addressError && (
            <p className="mt-2 text-sm text-red-400">{addressError}</p>
          )}

          {/* Example addresses */}
          {!address && (
            <p className="mt-2 text-xs text-green-500/50">
              Example: {EXAMPLE_ADDRESSES[0]}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !!addressError || !address.trim()}
            className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold rounded-lg hover:from-green-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] relative overflow-hidden"
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Report...
              </span>
            ) : (
              'Generate Report'
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/30 border-2 border-red-500/50 rounded-lg text-red-400">
            <p className="text-center">{error}</p>
          </div>
        )}

        {/* Results */}
        {stats && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {/* Days on Base */}
              <div className="bg-gray-900 border-2 border-green-500/50 rounded-lg p-6 hover:border-green-400 hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-all duration-300 transform hover:scale-105">
                <div className="text-green-500/70 text-sm mb-2 uppercase tracking-wider">
                  Days on Base
                </div>
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {stats.daysActive}
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-transparent rounded" />
              </div>

              {/* Transactions */}
              <div className="bg-gray-900 border-2 border-cyan-500/50 rounded-lg p-6 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300 transform hover:scale-105">
                <div className="text-cyan-500/70 text-sm mb-2 uppercase tracking-wider">
                  Transactions
                </div>
                <div className="text-4xl font-bold text-cyan-400 mb-2">
                  {stats.txCount.toLocaleString()}
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-transparent rounded" />
              </div>

              {/* ETH Burned on Gas */}
              <div className="bg-gray-900 border-2 border-green-500/50 rounded-lg p-6 hover:border-green-400 hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-all duration-300 transform hover:scale-105">
                <div className="text-green-500/70 text-sm mb-2 uppercase tracking-wider">
                  ETH Burned on Gas
                </div>
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {stats.gasSpent}
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-transparent rounded" />
              </div>
            </div>

            {imageUrl && (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={imageUrl}
                  alt="BASE PULSE OG preview"
                  className="w-full max-w-2xl rounded-xl border border-gray-800 shadow-2xl"
                />
                <div className="flex gap-4">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-cyan-500 px-6 py-2 text-cyan-300 hover:bg-cyan-500/10 transition"
                  >
                    Download
                  </a>
                  {currentShareUrl && (
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center justify-center rounded-lg border border-green-500 px-6 py-2 text-green-300 hover:bg-green-500/10 transition"
                    >
                      Share
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

