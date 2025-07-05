import { http } from 'wagmi';
import { mainnet, sepolia, mantle } from 'wagmi/chains';
import { createConfig } from '@privy-io/wagmi';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, mantle],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [mantle.id]: http(),
  },
}); 