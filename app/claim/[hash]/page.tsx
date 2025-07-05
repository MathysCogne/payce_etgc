'use client'

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';

type Transfer = {
  amount: number;
  recipient_phone_number: string;
  status: string;
}

export default function ClaimPage({ params }: { params: { hash: string } }) {
  const { ready, authenticated, user } = usePrivy();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTransfer() {
      if (!params.hash) return;
      
      try {
        const { data, error } = await supabase
          .from('transfers')
          .select('*')
          .eq('claim_hash', params.hash)
          .single();

        if (error) throw new Error(error.message);
        if (data) {
          setTransfer(data);
          if (data.status === 'claimed') {
            setError('This transfer has already been claimed.');
          }
        } else {
          setError('Transfer not found.');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch transfer details.');
      } finally {
        setLoading(false);
      }
    }

    fetchTransfer();
  }, [params.hash, supabase]);

  const handleClaim = async () => {
    setIsClaiming(true);
    toast.loading('Claiming your funds...');

    try {
      const response = await fetch('/api/execute-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimHash: params.hash,
          recipientAddress: user?.wallet?.address,
        }),
      });

      const result = await response.json();
      toast.dismiss();

      if (result.success) {
        toast.success(`Funds sent! Transaction: ${result.txHash.slice(0,10)}...`);
        setTransfer(prev => prev ? { ...prev, status: 'claimed' } : null);
      } else {
        toast.error(result.message || 'Claim failed.');
      }
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.message || 'An error occurred during claim.');
    } finally {
      setIsClaiming(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p>Loading transfer details...</p>;
    }
    if (error) {
      return <p className="text-red-500">{error}</p>;
    }
    if (transfer) {
      return (
        <>
          <CardHeader>
            <CardTitle className="text-3xl">You've Received a Payment!</CardTitle>
            <CardDescription>You have received {transfer.amount} USDC.</CardDescription>
          </CardHeader>
          <CardContent>
            {transfer.status === 'claimed' ? (
              <p className="text-green-500 font-bold">You have already claimed these funds.</p>
            ) : (
              ready && authenticated ? (
                <Button 
                  onClick={handleClaim} 
                  disabled={isClaiming}
                  className="w-full h-12 text-lg"
                >
                  {isClaiming ? 'Claiming...' : `Claim ${transfer.amount} USDC`}
                </Button>
              ) : (
                <p>Please connect your wallet to claim your funds.</p>
              )
            )}
          </CardContent>
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <Header />
      <Toaster richColors />
      <main className="flex items-center justify-center py-20 px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          {renderContent()}
        </Card>
      </main>
    </div>
  );
} 