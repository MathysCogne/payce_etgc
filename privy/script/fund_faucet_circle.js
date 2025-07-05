import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const API = 'https://api.circle.com/v1'
const API_KEY = process.env.CIRCLE_API_KEY

const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
}

// 1. Create a new wallet
async function createWallet() {
  const res = await fetch(`${API}/w3s/wallets`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ blockchains: ['base-sepolia'] })
  })
  const data = await res.json()
  return data.data
}

// 2. Fund wallet with USDC (testnet mint)
async function mintUSDC(walletId) {
  const res = await fetch(`${API}/w3s/deposits/mint`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      wallet_id: walletId,
      asset: 'USDC',
      amount: '10.0',
      chain: 'base-sepolia'
    })
  })
  const data = await res.json()
  return data.data
}

// 3. Transfer USDC to Metamask wallet
async function sendUSDC(walletId, destination) {
  const res = await fetch(`${API}/w3s/transactions/transfer`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      wallet_id: walletId,
      asset: 'USDC',
      amount: '10.0',
      destination_address: destination,
      chain: 'base-sepolia'
    })
  })
  const data = await res.json()
  return data.data
}

async function run() {
  try {
    const { id: walletId, address } = await createWallet()
    console.log('✅ Wallet created:', walletId, address)

    await mintUSDC(walletId)
    console.log('💰 Wallet funded with 10 USDC')

    const destination = process.env.DESTINATION_ADDRESS
    const tx = await sendUSDC(walletId, destination)
    console.log('🚀 USDC sent to Metamask:', tx)
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

run()
