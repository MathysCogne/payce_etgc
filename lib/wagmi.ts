import { http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { createConfig } from '@privy-io/wagmi';

const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Sepolia Explorer', url: 'https://explorer.sepolia.mantle.xyz' },
  },
  testnet: true,
};

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, mantleSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [mantleSepolia.id]: http(),
  },
}); 