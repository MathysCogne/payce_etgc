'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useBalance } from 'wagmi'
import { mantle } from 'wagmi/chains'
import { USDC_MANTLE_ADDRESS } from '@/lib/constants'

export function Header() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  const { data: usdcBalance } = useBalance({
    address: user?.wallet?.address as `0x${string}` | undefined,
    token: USDC_MANTLE_ADDRESS,
    chainId: mantle.id,
    query: {
      enabled: !!user?.wallet?.address,
    },
  })

  const connectWallet = () => {
    if (ready && !authenticated) {
      login()
    }
  }

  const disconnectWallet = () => {
    if (ready && authenticated) {
      logout()
    }
  }

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b bg-background">
      {/* Logo */}
      <Link href="/" className="text-xl font-semibold tracking-tight">
        Payce
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-4">
        <Link href="#features" className="text-sm hover:underline">Features</Link>
        <Link href="#how" className="text-sm hover:underline">How it works</Link>
        <Link href="#faq" className="text-sm hover:underline">FAQ</Link>
        {ready && authenticated && user?.wallet ? (
          <div className="flex items-center gap-4 ml-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {usdcBalance?.formatted
                  ? `${parseFloat(usdcBalance.formatted).toFixed(2)} ${usdcBalance.symbol}`
                  : 'Loading...'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
              </p>
            </div>
            <Button variant="outline" onClick={disconnectWallet}>
              Logout
            </Button>
          </div>
        ) : (
          <Button variant="default" className="ml-4" onClick={connectWallet} disabled={!ready}>
            Connect
          </Button>
        )}
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="#features">Features</Link>
              <Link href="#how">How it works</Link>
              <Link href="#faq">FAQ</Link>
              {ready && authenticated && user?.wallet ? (
                <div className="flex flex-col items-start gap-4 mt-4">
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {usdcBalance?.formatted
                        ? `${parseFloat(usdcBalance.formatted).toFixed(2)} ${usdcBalance.symbol}`
                        : 'Loading...'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                    </p>
                  </div>
                  <Button variant="outline" onClick={disconnectWallet} className="w-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <Button className="mt-4" onClick={connectWallet} disabled={!ready}>
                  Connect
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
