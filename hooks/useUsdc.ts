import { useState, useCallback, useEffect } from 'react'
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

interface UseUsdcBalanceReturn {
  formattedBalance: string | null;
  rawBalance: string | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => void;
}

export function useUsdcBalance(address: string | undefined): UseUsdcBalanceReturn {
  const [formattedBalance, setFormattedBalance] = useState<string | null>(null);
  const [rawBalance, setRawBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address || !isValidAddress(address)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedBalance = await getUsdcBalance(address);
      setFormattedBalance(parseFloat(fetchedBalance).toFixed(2));
      setRawBalance(fetchedBalance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    formattedBalance,
    rawBalance,
    loading,
    error,
    refreshBalance: fetchBalance,
  };
}