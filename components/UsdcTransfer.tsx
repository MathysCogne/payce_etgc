'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useUsdc } from '@/hooks/useUsdc'
import { isValidAddress } from '@/lib/usdc'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function UsdcTransfer() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)
  
  const { sendUsdcTransaction, isLoading, error, clearError } = useUsdc()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!recipient || !amount) {
      return
    }

    try {
      clearError()
      const hash = await sendUsdcTransaction(recipient, parseFloat(amount))
      setTxHash(hash)
      
      // Reset form on success
      setRecipient('')
      setAmount('')
    } catch (err) {
      console.error('Transfer failed:', err)
    }
  }

  const isValidForm = recipient && amount && isValidAddress(recipient) && parseFloat(amount) > 0

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>💰</span>
          USDC Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {txHash && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Transfer successful! 
              <a 
                href={`https://explorer.mantle.xyz/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:underline"
              >
                View on Explorer
              </a>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={!recipient ? '' : isValidAddress(recipient) ? 'border-green-500' : 'border-red-500'}
            />
            {recipient && !isValidAddress(recipient) && (
              <p className="text-sm text-red-500">Invalid Ethereum address</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValidForm || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send USDC'
            )}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground text-center">
          Transfers are executed on Mantle Mainnet
        </div>
      </CardContent>
    </Card>
  )
}