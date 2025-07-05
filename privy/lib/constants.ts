// Arbitrum Sepolia Domain ID
export const ARBITRUM_SEPOLIA_DOMAIN = 3;

// Contract Addresses
export const SEPOLIA_USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7aA8';
export const ARBITRUM_SEPOLIA_USDC_ADDRESS = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';
export const SEPOLIA_TOKEN_MESSENGER_ADDRESS = '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA';
export const ARBITRUM_SEPOLIA_MESSAGE_TRANSMITTER_ADDRESS = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275';


export const APP_HOLDING_WALLET_ADDRESS = '0x32994cFFCE95CdbE03CF81149793E4Dbe8b249eE'; 

// Circle API
export const CIRCLE_API_URL = 'https://iris-api-sandbox.circle.com';

// ABIs - Simplified for clarity, containing only the functions we use.
export const USDC_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const TOKEN_MESSENGER_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint32", "name": "destinationDomain", "type": "uint32" },
      { "internalType": "bytes32", "name": "mintRecipient", "type": "bytes32" },
      { "internalType": "address", "name": "burnToken", "type": "address" }
    ],
    "name": "depositForBurn",
    "outputs": [{ "internalType": "uint64", "name": "_nonce", "type": "uint64" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const MESSAGE_TRANSMITTER_ABI = [
  {
    "inputs": [
      { "internalType": "bytes", "name": "message", "type": "bytes" },
      { "internalType": "bytes", "name": "attestation", "type": "bytes" }
    ],
    "name": "receiveMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const; 