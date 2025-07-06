"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type VirtualCardProps = {
  amount: number;
};

const CardInfoItem = ({ label, value }: { label: string; value: string }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="flex-1 p-4 bg-zinc-100 rounded-2xl">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
            <span className="text-xs text-zinc-500 font-bold uppercase">{label}</span>
            <span className="font-mono font-bold text-lg">{value}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
            <Copy className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export function VirtualCard({ amount }: VirtualCardProps) {
  const cardNumber = process.env.NEXT_PUBLIC_CARD_NUMBER || "4000 1234 5678 XXXX";
  const cardExp = process.env.NEXT_PUBLIC_CARD_EXP || "XXXX";
  const cardSec = process.env.NEXT_PUBLIC_CARD_SEC || "XXX";
  
  const copyCardNumber = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    toast.success("Card number copied!");
  };

  const handleAddToWallet = () => {
    toast.info("This feature is coming soon!");
  };

  return (
    <div className="w-full max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 text-black rounded-2xl p-6 flex flex-col justify-between h-56 shadow-[8px_8px_0px_#000] border-2 border-black">
            <div className="flex justify-between items-start">
                <span className="text-xl font-black uppercase">Magic Card</span>
                <div className="text-right">
                <span className="text-sm font-bold">Balance</span>
                <p className="text-5xl font-black">${amount.toFixed(2)}</p>
                </div>
            </div>
            <button 
                onClick={copyCardNumber}
                className="w-full text-center font-mono text-2xl font-bold tracking-widest hover:bg-black/10 rounded-md py-1"
            >
                {cardNumber}
            </button>
        </div>
        <div className="mt-4 grid gap-3">
            <div className="flex gap-3">
              <CardInfoItem label="Expires" value={cardExp} />
              <CardInfoItem label="CVC" value={cardSec} />
            </div>
            <Button 
              variant="outline" 
              className="w-full h-14 text-lg font-bold rounded-2xl border-2 border-black bg-white"
              onClick={handleAddToWallet}
            >
                Add to Apple Wallet
            </Button>
        </div>
    </div>
  );
} 