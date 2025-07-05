'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface TransactionDetails {
  amount: number;
  sender_did: string; // We can fetch sender's info later if needed
  status: 'pending' | 'claimed' | 'expired';
}

export default function ClaimPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const params = useParams();
  const hash = params.hash as string;

  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    async function fetchTransaction() {
      if (!hash) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/claim/${hash}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch transaction details.');
        }
        setTransaction(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTransaction();
  }, [hash]);

  const handleClaim = async () => {
    if (!user || !user.wallet) {
      toast.error('Please connect your wallet to claim.');
      return;
    }

    try {
      setClaiming(true);
      const response = await fetch(`/api/claim/${hash}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privyDid: user.id,
          userWalletAddress: user.wallet.address,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim funds.');
      }
      toast.success('Funds claimed successfully!');
      // Refresh transaction data
      if (transaction) {
        setTransaction({ ...transaction, status: 'claimed' });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setClaiming(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-10">
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-10">
          <p>Transaction not found or invalid.</p>
        </div>
      </div>
    );
  }

  const canClaim = authenticated && transaction.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-10">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>You've Received a Payment!</CardTitle>
              <CardDescription>
                Someone sent you {transaction.amount} USDC.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-md">
                <p className="text-4xl font-bold text-center">{transaction.amount} <span className="text-2xl text-gray-500">USDC</span></p>
              </div>
              
              {transaction.status === 'claimed' && (
                <p className="text-center text-green-600">These funds have already been claimed.</p>
              )}

              {transaction.status === 'expired' && (
                <p className="text-center text-red-600">This transaction has expired.</p>
              )}

              {ready && !authenticated && transaction.status === 'pending' && (
                <Button onClick={login} className="w-full">
                  Log in to Claim
                </Button>
              )}

              {ready && authenticated && transaction.status === 'pending' && (
                <Button onClick={handleClaim} disabled={!canClaim || claiming} className="w-full">
                  {claiming ? 'Claiming...' : 'Claim Now'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 