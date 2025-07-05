'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAccount, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

import { useTokenApproval } from '@/hooks/useTokenApproval';
import { useTokenMessenger } from '@/hooks/useTokenMessenger';
import {
  APP_HOLDING_WALLET_ADDRESS,
  SEPOLIA_TOKEN_MESSENGER_ADDRESS,
  SEPOLIA_USDC_ADDRESS,
  USDC_ABI,
} from '@/lib/constants';

interface SendConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  amount: number;
}

export function SendConfirmationDialog({ open, onClose, onSuccess, amount }: SendConfirmationDialogProps) {
  const { address } = useAccount();
  const [isApproving, setIsApproving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | undefined>();

  const { approve } = useTokenApproval(SEPOLIA_USDC_ADDRESS);
  const { depositForBurn } = useTokenMessenger();

  const { data: allowance, refetch } = useReadContract({
    address: SEPOLIA_USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address!, SEPOLIA_TOKEN_MESSENGER_ADDRESS],
    query: { enabled: !!address },
  });

  const { isSuccess: isApprovalMined, isLoading: isConfirmingApproval } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  });

  useEffect(() => {
    if(isApprovalMined) {
      toast.success('Approval confirmed!');
      refetch();
    }
  }, [isApprovalMined, refetch])
  
  const isAllowanceSufficient = allowance ? allowance >= parseUnits(amount.toString(), 6) : false;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const hash = await approve(amount);
      setApprovalTxHash(hash);
      toast.info('Approval transaction sent. Waiting for confirmation...');
    } catch (e) {
      console.error(e);
      toast.error('Approval failed.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const hash = await depositForBurn(amount, APP_HOLDING_WALLET_ADDRESS as `0x${string}`, SEPOLIA_USDC_ADDRESS);
      toast.success('Burn transaction sent!');
      onSuccess(hash);
    } catch (e) {
      console.error(e);
      toast.error('Burn transaction failed.');
    } finally {
      setIsSending(false);
    }
  };

  const buttonAction = isAllowanceSufficient ? handleSend : handleApprove;
  const buttonDisabled = isApproving || isConfirmingApproval || isSending || (isAllowanceSufficient && isSending);
  const buttonText = () => {
    if (isApproving || isConfirmingApproval) return 'Approving...';
    if (!isAllowanceSufficient) return 'Approve';
    if (isSending) return 'Sending...';
    return 'Send';
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Transfer</DialogTitle>
          <DialogDescription>
            You are about to send {amount} USDC from Sepolia to Arbitrum Sepolia.
            This requires two transactions: one to approve and one to send.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p><strong>Amount:</strong> {amount} USDC</p>
          <p><strong>To:</strong> App Holding Wallet</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={buttonAction} disabled={buttonDisabled}>
            {buttonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 