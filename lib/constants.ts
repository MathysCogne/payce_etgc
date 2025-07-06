export const USDC_MANTLE_ADDRESS = '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9' as const;
// Note: This is now the mainnet address for USDC.

export const SPONSOR_WALLET_ADDRESS: string = process.env.NEXT_PUBLIC_SPONSOR_WALLET_ADDRESS || '0x...YOUR_SPONSOR_WALLET_ADDRESS';

export const mantle = {
  id: 5000,
  name: 'Mantle',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://explorer.mantle.xyz' },
  },
} as const; 