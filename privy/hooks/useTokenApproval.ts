import { useCallback } from 'react';
import { useWriteContract } from 'wagmi';
import { getAddress, parseUnits } from 'viem';
import { USDC_ABI, SEPOLIA_TOKEN_MESSENGER_ADDRESS } from '@/lib/constants';

export const useTokenApproval = (tokenAddress: `0x${string}`) => {
  const { writeContractAsync } = useWriteContract();

  const approve = useCallback(async (amount: number) => {
    const amountToApprove = parseUnits(amount.toString(), 6);
    return writeContractAsync({
      address: getAddress(tokenAddress),
      abi: USDC_ABI,
      functionName: 'approve',
      args: [getAddress(SEPOLIA_TOKEN_MESSENGER_ADDRESS), amountToApprove],
    });
  }, [tokenAddress, writeContractAsync]);

  return { approve };
}; 