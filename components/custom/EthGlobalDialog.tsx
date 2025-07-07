"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { AlertTriangle, Award, PartyPopper, Rocket } from "lucide-react"

interface EthGlobalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EthGlobalDialog({ open, onOpenChange }: EthGlobalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-lg border-4 border-black bg-stone-100 text-black shadow-[8px_8px_0px_#000]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-3 text-3xl font-bold text-center">
            {/* <PartyPopper className="h-8 w-8 text-pink-500" /> */}
            <span>Welcome to Payce!</span>
            <PartyPopper className="h-8 w-8 text-pink-500" />
          </DialogTitle>
          <DialogDescription className="!mt-2 text-center text-base text-gray-700">
            This project was built for the ETHGlobal Cannes 2025 hackathon.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 space-y-5">
          <ul className="space-y-3">
            <li className="flex items-center justify-center gap-3 rounded-lg border-2 border-black bg-white p-4 text-center text-lg font-semibold shadow-[4px_4px_0px_#000]">
              <Award className="h-7 w-7 text-yellow-500" />
              <span>Best Finance App (Mantle)</span>
            </li>
            <li className="flex items-center justify-center gap-3 rounded-lg border-2 border-black bg-white p-4 text-center text-lg font-semibold shadow-[4px_4px_0px_#000]">
              <Award className="h-7 w-7 text-yellow-500" />
              <span>Best App Using Stablecoin (Privy)</span>
            </li>
          </ul>
          <div className="rounded-lg border-2 border-black bg-yellow-300 p-4 text-black shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-center text-center font-bold">
              <AlertTriangle className="mr-2 h-5 w-5" />
              <p>Demo Information</p>
            </div>
            <p className="mt-2 text-center text-sm">
              For demo purposes, SMS sending and claim confirmation codes are
              currently disabled. This allows everyone to explore the app freely.
            </p>
            <p className="mt-2 text-center text-sm">
              <span className="font-bold">
                Warning, this demo is on mainnet!
              </span>
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => onOpenChange(false)}
            className="flex w-full items-center justify-center gap-3 border-2 border-black bg-white font-bold text-black shadow-[4px_4px_0px_#000] transition-all hover:bg-black hover:text-white hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Rocket className="h-5 w-5" />
            Start Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 