/**
 * Validation utilities for Ethereum addresses and other inputs
 */

/**
 * Validates Ethereum address format (basic check)
 * @param address - Address to validate
 * @returns true if address is valid Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }
  // Basic format check: 0x followed by 40 hex characters
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim())
}

/**
 * Normalizes Ethereum address to lowercase
 * @param address - Address to normalize
 * @returns Normalized address
 */
export function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

/**
 * Gets validation error message for address
 * @param address - Address to validate
 * @returns Error message or null if valid
 */
export function getAddressValidationError(address: string): string | null {
  if (!address) {
    return null
  }

  const trimmed = address.trim()

  if (trimmed.length === 0) {
    return null
  }

  if (trimmed.length < 42) {
    return 'Address is too short'
  }

  if (trimmed.length > 42) {
    return 'Address is too long'
  }

  if (!trimmed.startsWith('0x')) {
    return 'Address must start with 0x'
  }

  if (!/^0x[a-fA-F0-9]+$/.test(trimmed)) {
    return 'Address contains invalid characters'
  }

  if (!isValidEthereumAddress(trimmed)) {
    return 'Invalid address format'
  }

  return null
}

