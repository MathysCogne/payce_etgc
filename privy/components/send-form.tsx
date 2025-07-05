'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits, zeroAddress } from 'viem';
import {
  SEPOLIA_USDC_ADDRESS,
  SEPOLIA_TOKEN_MESSENGER_ADDRESS,
  USDC_ABI,
  TOKEN_MESSENGER_ABI,
} from '@/lib/constants';

const sendSchema = z.object({
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
});

type SendFormValues = z.infer<typeof sendSchema>;

export function SendForm() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SendFormValues>({
    resolver: zodResolver(sendSchema),
  });

  async function onSubmit(data: SendFormValues) {
    if (!address) {
      toast.error('Please connect your wallet first.');
      return;
    }

    const amountInSmallestUnit = parseUnits(data.amount.toString(), 6);

    try {
      // 1. Approve the Token Messenger to spend USDC
      toast.info('Approving USDC spend...');
      const approveHash = await writeContractAsync({
        address: SEPOLIA_USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [SEPOLIA_TOKEN_MESSENGER_ADDRESS, amountInSmallestUnit],
      });
      toast.success('Approval successful!');

      // 2. Deposit for burn
      toast.info('Initiating transfer...');
      const burnHash = await writeContractAsync({
        address: SEPOLIA_TOKEN_MESSENGER_ADDRESS,
        abi: TOKEN_MESSENGER_ABI,
        functionName: 'depositForBurn',
        args: [
          amountInSmallestUnit,
          0, // Destination domain for Ethereum Sepolia
          zeroAddress, // Placeholder for mintRecipient
          SEPOLIA_USDC_ADDRESS,
          zeroAddress, // destinationCaller
          BigInt(0), // maxFee
          0, // minFinalityThreshold (uint32 is a number)
        ],
      });

      // 3. Send transaction details to our backend
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, burnTxHash: burnHash, senderDid: address }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Backend error');

      toast.success(`Transfer initiated successfully!`);
      reset();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'An error occurred.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send USDC</CardTitle>
        <CardDescription>Send USDC to anyone with a phone number.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+1 555-555-5555" {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input id="amount" type="number" placeholder="10.00" step="0.01" {...register('amount')} />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Confirm in wallet...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 