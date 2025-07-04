'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import Link from 'next/link'

export function Header() {
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
        <Button variant="default" className="ml-4">Connect</Button>
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
              <Button className="mt-4">Connect</Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
