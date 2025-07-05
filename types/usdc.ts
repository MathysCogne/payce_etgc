export interface UsdcTransferRequest {
  toAddress: string
  amount: number
  message?: string
}

export interface UsdcTransferResponse {
  txHash: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
}

export interface WalletBalance {
  address: string
  usdcBalance: string
  formattedBalance: string
  lastUpdated: number
}

export interface TransactionHistory {
  hash: string
  from: string
  to: string
  amount: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  blockNumber?: number
}