import { useState, useCallback } from 'react'
import { sendUsdc, getUsdcBalance, waitForTransaction, isValidAddress } from '@/lib/usdc'
import { usePrivy } from '@privy-io/react-auth'

interface UseUsdcReturn {
  sendUsdcTransaction: (toAddress: string, amount: number) => Promise<string>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useUsdc(): UseUsdcReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = usePrivy()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const sendUsdcTransaction = useCallback(async (toAddress: string, amount: number): Promise<string> => {
    if (!user?.wallet) {
      throw new Error('Wallet not connected')
    }

    if (!isValidAddress(toAddress)) {
      throw new Error('Invalid recipient address')
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Note: En production, vous devriez utiliser la clé privée de manière sécurisée
      // Ici, on assume qu'elle est disponible via une méthode sécurisée
      const privateKey = process.env.PRIVATE_KEY
      
      if (!privateKey) {
        throw new Error('Private key not configured')
      }

      const txHash = await sendUsdc(privateKey, toAddress, amount)
      
      // Attendre la confirmation (optionnel)
      await waitForTransaction(txHash)
      
      return txHash
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return {
    sendUsdcTransaction,
    isLoading,
    error,
    clearError
  }
}