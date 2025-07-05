import { getUsdcBalance } from './usdc'

// Fonction pour formatter une adresse (affichage tronqué)
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Fonction pour formatter un montant USDC
export function formatUsdcAmount(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(num)
}

// Fonction pour obtenir les informations d'un wallet
export async function getWalletInfo(address: string) {
  try {
    const usdcBalance = await getUsdcBalance(address)
    
    return {
      address,
      usdcBalance: parseFloat(usdcBalance),
      formattedBalance: formatUsdcAmount(usdcBalance)
    }
  } catch (error) {
    console.error('Error getting wallet info:', error)
    return null
  }
}

// Constantes utiles
export const MANTLE_EXPLORER_URL = 'https://explorer.mantle.xyz'
export const USDC_DECIMALS = 6

// Fonction pour générer un lien vers l'explorateur
export function getExplorerUrl(type: 'tx' | 'address' | 'token', value: string): string {
  switch (type) {
    case 'tx':
      return `${MANTLE_EXPLORER_URL}/tx/${value}`
    case 'address':
      return `${MANTLE_EXPLORER_URL}/address/${value}`
    case 'token':
      return `${MANTLE_EXPLORER_URL}/token/${value}`
    default:
      return MANTLE_EXPLORER_URL
  }
}