'use server'

interface BlockscoutTransaction {
  timeStamp: string
  from: string
  to: string
  gasUsed: string
  gasPrice: string
}

interface BlockscoutResponse {
  status: string
  message: string
  result: BlockscoutTransaction[]
}

interface BaseRPCResponse {
  jsonrpc: string
  id: number
  result?: string
  error?: {
    code: number
    message: string
  }
}

interface WalletStats {
  daysActive: number
  txCount: number
  gasSpent: string
}

const ZERO_STATS: WalletStats = {
  daysActive: 0,
  txCount: 0,
  gasSpent: '0.00000',
}

const RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://1rpc.io/base',
  'https://base-pokt.nodies.app',
]

const BLOCKSCOUT_API_BASE = 'https://base.blockscout.com/api'

/**
 * Get transaction count from Base RPC with node rotation
 */
async function getTxCountFromRPC(address: string): Promise<number> {
  // Try each RPC URL in sequence
  for (const rpcUrl of RPC_URLS) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getTransactionCount',
          params: [address, 'latest'],
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        console.warn(`RPC request failed for ${rpcUrl}:`, response.status, response.statusText)
        continue // Try next URL
      }

      const data: BaseRPCResponse = await response.json()

      if (data.error) {
        console.warn(`RPC error for ${rpcUrl}:`, data.error.message)
        continue // Try next URL
      }

      if (data.result) {
        const txCount = parseInt(data.result, 16)
        console.log(`Tx Count from RPC (${rpcUrl}): ${txCount}`)
        return txCount // Success, break the loop
      }
    } catch (error) {
      console.warn(`Error fetching tx count from ${rpcUrl}:`, error)
      // Continue to next URL
    }
  }

  // If all URLs failed, return 0
  console.error('All RPC URLs failed, could not get tx count')
  return 0
}

/**
 * Get days active from first transaction (Blockscout)
 */
async function getDaysActive(address: string): Promise<number> {
  try {
    const url = new URL(BLOCKSCOUT_API_BASE)
    url.searchParams.append('module', 'account')
    url.searchParams.append('action', 'txlist')
    url.searchParams.append('address', address)
    url.searchParams.append('sort', 'asc')
    url.searchParams.append('page', '1')
    url.searchParams.append('offset', '1')

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Blockscout first tx request failed:', response.status, response.statusText)
      return 0
    }

    const data: BlockscoutResponse = await response.json()

    if (data.status === '1' && data.result && Array.isArray(data.result) && data.result.length > 0) {
      const firstTx = data.result[0]
      if (firstTx.timeStamp) {
        const firstTxTimestamp = parseInt(firstTx.timeStamp, 10) * 1000 // Convert to milliseconds
        const now = Date.now()
        const diffMs = now - firstTxTimestamp
        const daysActive = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
        console.log(`Days Active: ${daysActive} (first tx: ${firstTx.timeStamp})`)
        return daysActive
      }
    }

    return 0
  } catch (error) {
    console.error('Error fetching days active from Blockscout:', error)
    return 0
  }
}

/**
 * Calculate gas spent by iterating through transactions (Blockscout)
 */
async function calculateGasSpent(address: string): Promise<string> {
  try {
    const normalizedAddress = address.toLowerCase()
    let page = 1
    const MAX_PAGES = 10
    let totalGasWei = BigInt(0)

    while (page <= MAX_PAGES) {
      const url = new URL(BLOCKSCOUT_API_BASE)
      url.searchParams.append('module', 'account')
      url.searchParams.append('action', 'txlist')
      url.searchParams.append('address', normalizedAddress)
      url.searchParams.append('sort', 'desc')
      url.searchParams.append('page', page.toString())
      url.searchParams.append('offset', '1000')

      const response = await fetch(url.toString(), {
        cache: 'no-store',
      })

      if (!response.ok) {
        console.error(`Blockscout gas calculation request failed for page ${page}:`, response.status, response.statusText)
        // If first page fails, return zero
        if (page === 1) {
          return '0.00000'
        }
        // If later page fails, break and use what we have
        break
      }

      const data: BlockscoutResponse = await response.json()

      if (data.status !== '1' || !data.result || !Array.isArray(data.result)) {
        // No more transactions
        break
      }

      if (data.result.length === 0) {
        // No more transactions
        break
      }

      // IMPORTANT: Sum gas ONLY if from.toLowerCase() === address.toLowerCase()
      for (const tx of data.result) {
        if (tx.from && tx.from.toLowerCase() === normalizedAddress) {
          try {
            const gasUsed = BigInt(tx.gasUsed || '0')
            const gasPrice = BigInt(tx.gasPrice || '0')
            const txGas = gasUsed * gasPrice
            totalGasWei += txGas
          } catch (error) {
            console.warn('Unable to parse gas values:', { gasUsed: tx.gasUsed, gasPrice: tx.gasPrice }, error)
          }
        }
      }

      // If we got less than 1000 transactions, we've reached the end
      if (data.result.length < 1000) {
        break
      }

      page++
    }

    // Convert Wei to ETH and round to 5 decimal places
    const gasSpentEth = Number(totalGasWei) / 1e18
    const gasSpent = Number.isFinite(gasSpentEth) ? gasSpentEth.toFixed(5) : '0.00000'
    console.log(`Gas Spent: ${gasSpent} ETH (processed ${page} page(s))`)

    return gasSpent
  } catch (error) {
    console.error('Error calculating gas spent:', error)
    return '0.00000'
  }
}

export async function getWalletStats(address: string): Promise<WalletStats> {
  if (!address) {
    return ZERO_STATS
  }

  const normalizedAddress = address.trim()

  // Execute all three requests independently with error handling
  const [txCountResult, daysActiveResult, gasSpentResult] = await Promise.allSettled([
    getTxCountFromRPC(normalizedAddress),
    getDaysActive(normalizedAddress),
    calculateGasSpent(normalizedAddress),
  ])

  // Extract results with fallback to zero
  const txCount = txCountResult.status === 'fulfilled' ? txCountResult.value : 0
  const daysActive = daysActiveResult.status === 'fulfilled' ? daysActiveResult.value : 0
  const gasSpent = gasSpentResult.status === 'fulfilled' ? gasSpentResult.value : '0.00000'

  console.log('Final stats:', { txCount, daysActive, gasSpent })

  return {
    txCount,
    daysActive,
    gasSpent,
  }
}
