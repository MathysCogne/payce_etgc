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
import { SendConfirmationDialog } from '@/components/SendConfirmationDialog';

const sendSchema = z.object({
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
});

type SendFormValues = z.infer<typeof sendSchema>;

export function SendForm() {
  const { user } = usePrivy();
  const [isConfirming, setIsConfirming] = useState(false);
  const [formValues, setFormValues] = useState<SendFormValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<SendFormValues>({
    resolver: zodResolver(sendSchema),
    mode: 'onChange',
  });

  function onSubmit(data: SendFormValues) {
    if (!user) {
      toast.error('Please log in to send funds.');
      return;
    }
    setFormValues(data);
    setIsConfirming(true);
  }

  const handleSuccess = (txHash: string) => {
    // Here, we could also make an API call to our backend to save the transaction details
    // For now, we'll just show a success message and close the dialog
    toast.success(`Transaction sent successfully! Hash: ${txHash}`);
    setIsConfirming(false);
    reset();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Send USDC</CardTitle>
          <CardDescription>
            Send USDC cross-chain to anyone with just a phone number.
            <br />
            (From Sepolia to Arbitrum Sepolia)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        </CardContent>
      </Card>
      {isConfirming && formValues && (
        <SendConfirmationDialog
          open={isConfirming}
          onClose={() => setIsConfirming(false)}
          onSuccess={handleSuccess}
          amount={formValues.amount}
        />
      )}
    </>
  );
} 