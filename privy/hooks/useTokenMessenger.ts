import { useCallback } from 'react';
import { useWriteContract } from 'wagmi';
import { getAddress, parseUnits } from 'viem';
import { TOKEN_MESSENGER_ABI, SEPOLIA_TOKEN_MESSENGER_ADDRESS } from '@/lib/constants';
import { addressToBytes32 } from '@/utils/helpers';
import { ARBITRUM_SEPOLIA_DOMAIN } from '@/lib/constants';

export const useTokenMessenger = () => {
  const { writeContractAsync } = useWriteContract();

  const depositForBurn = useCallback(
    async (amount: number, mintRecipient: `0x${string}`, burnToken: `0x${string}`) => {
      const amountInSmallestUnit = parseUnits(amount.toString(), 6);
      const mintRecipientBytes32 = addressToBytes32(mintRecipient);

      return writeContractAsync({
        address: getAddress(SEPOLIA_TOKEN_MESSENGER_ADDRESS),
        abi: TOKEN_MESSENGER_ABI,
        functionName: 'depositForBurn',
        args: [
          amountInSmallestUnit,
          ARBITRUM_SEPOLIA_DOMAIN,
          mintRecipientBytes32,
          getAddress(burnToken),
        ],
      });
    },
    [writeContractAsync]
  );

  return { depositForBurn };
}; 