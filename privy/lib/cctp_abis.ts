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
      { "internalType": "address", "name": "burnToken", "type": "address" },
      { "internalType": "bytes32", "name": "destinationCaller", "type": "bytes32" },
      { "internalType": "uint256", "name": "maxFee", "type": "uint256" },
      { "internalType": "uint32", "name": "minFinalityThreshold", "type": "uint32" }
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