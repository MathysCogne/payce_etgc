'use client'

import { useState, useEffect, use } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';

type Transfer = {
  amount: number;
  recipient_phone_number: string;
  status: string;
}

type ClaimStep = 'initial' | 'otp_sent' | 'claimed';

interface ClaimPageParams {
  hash: string;
}

export default function ClaimPage({ params }: { params: Promise<ClaimPageParams> }) {
  const { hash } = use(params);
  const { ready, authenticated, user } = usePrivy();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<ClaimStep>('initial');
  const [otp, setOtp] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchTransfer() {
      if (!hash) return;
      
      try {
        const { data, error } = await supabase
          .from('transfers')
          .select('*')
          .eq('claim_hash', hash)
          .single();

        if (error) throw new Error(error.message);
        if (data) {
          setTransfer(data);
          if (data.status === 'claimed') {
            setStep('claimed');
          }
        } else {
          setError('Transfer not found.');
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to fetch transfer details.');
      } finally {
        setLoading(false);
      }
    }

    fetchTransfer();
  }, [hash, supabase]);
  
  const handleSendOtp = async () => {
    setIsProcessing(true);
    toast.loading('Sending verification code...');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimHash: hash }),
      });
      const result = await response.json();
      toast.dismiss();
      if (!result.success) throw new Error(result.message);
      
      toast.success('Code sent to your phone!');
      setStep('otp_sent');
    } catch (e: unknown) {
      toast.dismiss();
      const errorMessage = e instanceof Error ? e.message : 'Could not send verification code.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleClaim = async () => {
    setIsProcessing(true);
    toast.loading('Verifying and claiming your funds...');

    try {
      const response = await fetch('/api/execute-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimHash: hash,
          recipientAddress: user?.wallet?.address,
          otpCode: otp,
        }),
      });

      const result = await response.json();
      toast.dismiss();

      if (result.success) {
        toast.success(`Funds sent! Tx: ${result.txHash.slice(0,10)}...`);
        setStep('claimed');
      } else {
        toast.error(result.message || 'Claim failed.');
      }
    } catch (e: unknown) {
      toast.dismiss();
      const errorMessage = e instanceof Error ? e.message : 'An error occurred during claim.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderInitialStep = () => (
    <>
      <CardHeader>
        <CardTitle className="text-3xl">You&apos;ve Received a Payment!</CardTitle>
        <CardDescription>You have received {transfer?.amount} USDC.</CardDescription>
      </CardHeader>
      <CardContent>
        {ready && authenticated ? (
          <Button 
            onClick={handleSendOtp} 
            disabled={isProcessing}
            className="w-full h-12 text-lg"
          >
            {isProcessing ? 'Sending Code...' : `Claim ${transfer?.amount} USDC`}
          </Button>
        ) : (
          <p>Please connect your wallet to claim your funds.</p>
        )}
      </CardContent>
    </>
  );
  
  const renderOtpStep = () => (
    <>
      <CardHeader>
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>We sent a 6-digit code to your phone. Please enter it below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
          type="tel"
          maxLength={6}
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="text-center text-2xl h-14 tracking-widest"
        />
        <Button 
          onClick={handleClaim} 
          disabled={isProcessing || otp.length !== 6}
          className="w-full h-12 text-lg"
        >
          {isProcessing ? 'Claiming...' : `Verify & Claim`}
        </Button>
      </CardContent>
    </>
  );

  const renderClaimedStep = () => (
     <CardHeader>
        <CardTitle className="text-green-500">Funds Claimed!</CardTitle>
        <CardDescription>These funds have been successfully transferred to your wallet.</CardDescription>
      </CardHeader>
  );

  const renderContent = () => {
    if (loading) return <p className="p-6">Loading transfer details...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;
    
    switch(step) {
      case 'initial': return renderInitialStep();
      case 'otp_sent': return renderOtpStep();
      case 'claimed': return renderClaimedStep();
      default: return null;
    }
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