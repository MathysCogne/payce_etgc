import { createWalletClient, createPublicClient, http, parseUnits, formatUnits } from 'viem'
import { mantle } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// USDC Contract Address on Mantle Mainnet (bridged via Axelar)
export const USDC_MANTLE_CONTRACT = '0x09Bc4E0D864854c6AFbE6d2ea9127AcA4Ac0d808' as const

// USDC ABI (minimal pour transfer et balanceOf)
export const USDC_ABI = [
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  }
] as const

// Client public pour les lectures
export const publicClient = createPublicClient({
  chain: mantle,
  transport: http()
})

// Fonction pour créer un wallet client (à utiliser avec une clé privée)
export function createUsdcWalletClient(privateKey: string) {
  const account = privateKeyToAccount(privateKey as `0x${string}`)
  
  return createWalletClient({
    account,
    chain: mantle,
    transport: http()
  })
}

// Fonction pour obtenir le solde USDC d'une adresse
export async function getUsdcBalance(address: string): Promise<string> {
  try {
    const balance = await publicClient.readContract({
      address: USDC_MANTLE_CONTRACT,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`]
    })
    
    // USDC a 6 décimales sur Mantle
    return formatUnits(balance as bigint, 6)
  } catch (error) {
    console.error('Error fetching USDC balance:', error)
    throw error
  }
}

// Fonction pour envoyer des USDC
export async function sendUsdc(
  privateKey: string,
  toAddress: string, 
  amount: number
): Promise<string> {
  try {
    const walletClient = createUsdcWalletClient(privateKey)
    
    // Convertir le montant en unités USDC (6 décimales)
    const amountInUnits = parseUnits(amount.toString(), 6)
    
    // Effectuer le transfert
    const txHash = await walletClient.writeContract({
      address: USDC_MANTLE_CONTRACT,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [toAddress as `0x${string}`, amountInUnits]
    })
    
    return txHash
  } catch (error) {
    console.error('Error sending USDC:', error)
    throw error
  }
}

// Fonction pour vérifier qu'une transaction a été confirmée
export async function waitForTransaction(txHash: string) {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      timeout: 60_000 // 60 secondes timeout
    })
    
    return receipt
  } catch (error) {
    console.error('Error waiting for transaction:', error)
    throw error
  }
}

// Fonction utilitaire pour valider une adresse Ethereum
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Types pour TypeScript
export interface UsdcTransferParams {
  privateKey: string
  toAddress: string
  amount: number
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  blockNumber?: bigint
  gasUsed?: bigint
}