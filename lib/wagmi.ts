import { http } from 'wagmi'
import { mainnet } from 'wagmi/chains';
import { createConfig } from '@privy-io/wagmi';
import { mantle } from '@/lib/constants';

// Replace these with your app's chains
export const wagmiConfig = createConfig({
  chains: [mainnet, mantle],
  transports: {
    [mainnet.id]: http(),
    [mantle.id]: http(),
  },
}); 