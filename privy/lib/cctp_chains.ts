import type { Hex } from "viem";

export const sepoliaId = 11155111;
export const arbitrumSepoliaId = 421614;

export const CHAIN_TO_CHAIN_NAME: Record<number, string> = {
  [sepoliaId]: "Ethereum Sepolia",
  [arbitrumSepoliaId]: "Arbitrum Sepolia",
};

export const CHAIN_IDS_TO_USDC_ADDRESSES: Record<number, Hex> = {
  [sepoliaId]: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7aA8",
  [arbitrumSepoliaId]: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
};

export const CHAIN_IDS_TO_TOKEN_MESSENGER: Record<number, Hex> = {
  [sepoliaId]: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
  [arbitrumSepoliaId]: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
};

export const CHAIN_IDS_TO_MESSAGE_TRANSMITTER: Record<number, Hex> = {
  [sepoliaId]: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
  [arbitrumSepoliaId]: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
};

export const DESTINATION_DOMAINS: Record<number, number> = {
  [sepoliaId]: 0,
  [arbitrumSepoliaId]: 3,
};

export const IRIS_API_URL = "https://iris-api-sandbox.circle.com"; 