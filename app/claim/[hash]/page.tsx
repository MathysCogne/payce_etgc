'use client'

import { useState, useEffect, use } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import { ArrowRight, CheckCircle2, ShieldCheck, Gift, Home, CreditCard } from 'lucide-react';
import { CodeInput } from '@/components/custom/CodeInput';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { VirtualCard } from '@/components/custom/VirtualCard';


const IS_OTP_ENABLED = process.env.NEXT_PUBLIC_OTP_ENABLED === 'true';

type Transfer = {
  amount: number;
  recipient_phone_number: string;
  status: string;
}

type ClaimStep = 'initial' | 'otp_sent' | 'claimed' | 'card_generated';

interface ClaimPageParams {
  hash: string;
}

export default function ClaimPage({ params }: { params: Promise<ClaimPageParams> }) {
  const { hash } = use(params);
  const { ready, authenticated, user, login } = usePrivy();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<ClaimStep>('initial');
  const [otp, setOtp] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
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

  const handleGenerateCard = async () => {
    setIsProcessing(true);
    toast.loading('Generating your card...');

    try {
      const response = await fetch('/api/claim-by-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimHash: hash }),
      });
      const result = await response.json();
      toast.dismiss();

      if (result.success) {
        toast.success("Card generated!");
        setStep('card_generated');
        setShowConfetti(true);
      } else {
        throw new Error(result.message || 'Failed to generate card.');
      }
    } catch (e: unknown) {
      toast.dismiss();
      const errorMessage = e instanceof Error ? e.message : 'Could not generate card.';
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
        setShowConfetti(true); // Trigger confetti on success
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

  const handleClaimOrOtp = () => {
    if (IS_OTP_ENABLED) {
      handleSendOtp();
    } else {
      handleClaim();
    }
  };
  
  const renderInitialStep = () => (
    <>
      <CardHeader className="items-center text-center pb-0">
        <Gift className="w-20 h-20 mb-4 text-blue-500 mx-auto" />
        <CardTitle className="text-3xl font-black uppercase">You've Received a Payment!</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 pt-2">
        <div className="text-center">
            <p className="text-7xl font-black text-black">
                ${transfer?.amount}
            </p>
            <p className="text-2xl font-bold text-zinc-500">USDC</p>
        </div>
        <div className="space-y-3">
            <Button 
                onClick={handleClaimOrOtp} 
                disabled={isProcessing}
                className="w-full h-14 text-lg font-bold rounded-full bg-black text-white hover:bg-zinc-800 shadow-[4px_4px_0px_#999] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                {isProcessing ? 'Processing...' : `Claim to Wallet`}
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
                onClick={handleGenerateCard} 
                disabled={isProcessing}
                variant="outline"
                className="w-full h-14 text-lg font-bold rounded-full border-2 border-black bg-white hover:bg-zinc-100"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Generate a Card
            </Button>
        </div>
      </CardContent>
    </>
  );
  
  const renderOtpStep = () => (
    <>
      <CardHeader className="items-center text-center">
        <ShieldCheck className="w-20 h-20 mb-4 text-blue-500 mx-auto" />
        <CardTitle className="text-3xl font-black uppercase">Enter Verification Code</CardTitle>
        <CardDescription>We sent a 6-digit code to your phone. Please enter it below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CodeInput 
            length={6}
            onComplete={setOtp}
        />
        <Button 
          onClick={handleClaim} 
          disabled={isProcessing || otp.length !== 6}
          className="w-full h-14 text-lg font-bold rounded-full bg-black text-white hover:bg-zinc-800 shadow-[4px_4px_0px_#999] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          {isProcessing ? 'Claiming...' : `Verify & Claim`}
        </Button>
      </CardContent>
    </>
  );

  const renderClaimedStep = () => (
     <CardHeader className="items-center text-center">
        <CheckCircle2 className="w-20 h-20 mb-4 text-green-500 mx-auto" />
        <CardTitle className="text-3xl font-black uppercase text-green-500">Funds Claimed!</CardTitle>
        <CardDescription>These funds have been successfully transferred to your wallet.</CardDescription>
      </CardHeader>
  );

  const renderCardStep = () => (
      <VirtualCard amount={transfer?.amount || 0} />
  )

  const renderContent = () => {
    if (loading) return <div className="p-6 text-center">Loading transfer details...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
    
    switch(step) {
      case 'initial': return renderInitialStep();
      case 'otp_sent': return renderOtpStep();
      case 'claimed': return renderClaimedStep();
      case 'card_generated': return renderCardStep();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-yellow-100 dark:bg-yellow-900/50 text-black">
      {showConfetti && <Confetti recycle={false} />}
      <Link href="/" passHref>
        <Button variant="outline" className="fixed top-4 right-4 h-12 rounded-full bg-white border-2 border-black">
            <Home className="h-5 w-5" />
        </Button>
      </Link>
      <Toaster richColors />
      <main className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md border-2 border-black bg-white text-center shadow-[8px_8px_0px_#000]">
          {renderContent()}
        </Card>
      </main>
    </div>
  );
} 