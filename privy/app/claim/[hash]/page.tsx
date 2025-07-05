'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CIRCLE_API_URL, MESSAGE_TRANSMITTER_ABI, SEPOLIA_MESSAGE_TRANSMITTER_ADDRESS } from '@/lib/constants';

interface TransactionDetails {
  amount: number;
  sender_did: string;
  status: 'pending' | 'claimed' | 'expired';
}

interface Attestation {
  message: `0x${string}`;
  attestation: `0x${string}`;
}

type AttestationStatus = 'pending' | 'complete' | 'error';

export default function ClaimPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const params = useParams();
  const hash = params.hash as string;

  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [attestation, setAttestation] = useState<Attestation | null>(null);
  const [attestationStatus, setAttestationStatus] = useState<AttestationStatus>('pending');
  const { data: claimTxHash, writeContractAsync, isPending: isClaiming } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: claimTxHash,
    });

  useEffect(() => {
    async function fetchTransactionDetails() {
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
        setTransaction(null); // Clear transaction on error
      } finally {
        setLoading(false);
      }
    }

    fetchTransactionDetails();
  }, [hash]);

  useEffect(() => {
    if (!hash || transaction?.status !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${CIRCLE_API_URL}/v2/messages?transactionHash=${hash}`);
        const data = await response.json();
        
        // Find the correct message in the array
        const message = data.messages?.find((m: any) => m.transactionHash === hash);

        if (message && message.attestation && message.attestation !== 'PENDING') {
          setAttestation({ 
            message: message.message as `0x${string}`, 
            attestation: message.attestation as `0x${string}` 
          });
          setAttestationStatus('complete');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching attestation:', error);
        setAttestationStatus('error');
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [hash, attestationStatus, transaction]);

  useEffect(() => {
    async function markAsClaimedInDB() {
        if (isConfirmed) {
            toast.info("Updating database...");
            await fetch(`/api/claim/${hash}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ privyDid: user?.id, userWalletAddress: user?.wallet?.address }),
            });
            toast.success('Funds claimed and status updated!');
            if (transaction) {
                setTransaction({ ...transaction, status: 'claimed' });
            }
        }
    }
    markAsClaimedInDB();
  }, [isConfirmed, hash, user, transaction]);


  const handleClaim = async () => {
    if (!user || !user.wallet || !attestation) {
      toast.error('Cannot claim at this moment.');
      return;
    }
    await writeContractAsync({
      address: SEPOLIA_MESSAGE_TRANSMITTER_ADDRESS,
      abi: MESSAGE_TRANSMITTER_ABI,
      functionName: 'receiveMessage',
      args: [attestation.message, attestation.attestation],
    });
  };


  const getButtonState = () => {
    if (loading) return { text: 'Loading...', disabled: true };
    if (!transaction) return { text: 'Transaction not found', disabled: true };
    if (!authenticated) return { text: 'Log in to Claim', disabled: false, action: login };
    if (transaction.status !== 'pending') return { text: `Already ${transaction.status}`, disabled: true };
    if (attestationStatus === 'pending') return { text: 'Waiting for Attestation...', disabled: true };
    if (attestationStatus === 'error') return { text: 'Attestation Failed', disabled: true };
    if (isClaiming) return { text: 'Confirm in wallet...', disabled: true };
    if (isConfirming) return { text: 'Claiming funds...', disabled: true };
    if (isConfirmed) return { text: 'Claimed!', disabled: true };
    return { text: 'Claim Now', disabled: false, action: handleClaim };
  }

  const buttonState = getButtonState();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-10">
        <div className="max-w-md mx-auto">
          {!loading && !transaction ? (
            <Card>
              <CardHeader>
                <CardTitle>Claim Not Found</CardTitle>
                <CardDescription>This claim link is invalid or has expired.</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>You've Received a Payment!</CardTitle>
                <CardDescription>
                  Someone sent you {transaction?.amount} USDC.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-md">
                  <p className="text-4xl font-bold text-center">{transaction?.amount} <span className="text-2xl text-gray-500">USDC</span></p>
                </div>
                  <Button onClick={buttonState.action} disabled={buttonState.disabled} className="w-full">
                    {buttonState.text}
                  </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
} 