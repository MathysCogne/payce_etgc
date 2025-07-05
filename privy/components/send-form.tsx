'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { usePrivy } from '@privy-io/react-auth';
import { usePayce, TransferStep } from '@/hooks/usePayce';
import { useRouter } from 'next/navigation';

const sendSchema = z.object({
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
});

type SendFormValues = z.infer<typeof sendSchema>;

const stepToTitle: Record<TransferStep, string> = {
  idle: 'Send',
  approving: 'Approving Spend...',
  burning: 'Sending (Burning)...',
  'waiting-attestation': 'Waiting for Attestation...',
  minting: 'Finishing (Minting)...',
  completed: 'Completed!',
  error: 'Error!',
};

export function SendForm() {
  const { user } = usePrivy();
  const router = useRouter();
  const { currentStep, logs, error, executeTransfer, burnTxHash, reset } = usePayce();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SendFormValues>({
    resolver: zodResolver(sendSchema),
    mode: 'onChange',
  });

  const handleTransfer = async (data: SendFormValues) => {
    if (!user?.id) {
      toast.error('User not authenticated.');
      return;
    }
    await executeTransfer(data.phone, data.amount.toString(), user.id);
  };
  
  const isTransacting = currentStep !== 'idle' && currentStep !== 'completed' && currentStep !== 'error';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send USDC</CardTitle>
        <CardDescription>
          From Sepolia to Arbitrum Sepolia. The Circle backend will handle all transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === 'idle' ? (
          <form onSubmit={handleSubmit(handleTransfer)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Recipient's Phone Number</Label>
              <Input id="phone" placeholder="+1 555-555-5555" {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input id="amount" type="number" placeholder="10.00" step="0.01" {...register('amount')} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={!isValid}>
              Send
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">{stepToTitle[currentStep]}</h3>
            <div className="h-48 p-2 border rounded-md bg-gray-50 overflow-y-auto text-xs font-mono">
              {logs.map((log, i) => <p key={i}>{log}</p>)}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {currentStep === 'completed' && burnTxHash && (
                <Button onClick={() => router.push(`/claim/${burnTxHash}`)}>
                    Go to Claim Page
                </Button>
            )}
            <Button onClick={reset} disabled={isTransacting} variant="outline" className="w-full">
                Start New Transfer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 