"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSendTransaction, useSwitchChain, useAccount } from "wagmi";
import { parseUnits } from "viem";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "@/components/custom/CountrySelect";
import { USDC_MANTLE_ADDRESS, SPONSOR_WALLET_ADDRESS } from "@/lib/constants";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
};

export function SendCard() {
  const { ready, authenticated, user } = usePrivy();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: hash, sendTransaction, isPending, isSuccess, error: transactionError } = useSendTransaction();

  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [amount, setAmount] = useState("");
  const [isNotifying, setIsNotifying] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !phone) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (chain?.id !== mantleSepolia.id) {
      toast.error("Please switch to the Mantle Testnet to continue.");
      switchChain({ chainId: mantleSepolia.id });
      return;
    }
    if (!SPONSOR_WALLET_ADDRESS || SPONSOR_WALLET_ADDRESS.includes('...')) {
      toast.error("Sponsor wallet has not been configured.");
      return;
    }

    const amountInUnits = parseUnits(amount, 6);
    
    sendTransaction({
      to: USDC_MANTLE_ADDRESS,
      data: `0xa9059cbb${SPONSOR_WALLET_ADDRESS.substring(2).padStart(64, '0')}${amountInUnits.toString(16).padStart(64, '0')}` as `0x${string}`,
    });
  };

  useEffect(() => {
    if (isSuccess && hash) {
      setIsNotifying(true);
      toast.loading("Transaction successful! Notifying recipient...");
      
      fetch('/api/create-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderAddress: user?.wallet?.address,
          recipientPhone: `${countryCode}${phone}`,
          amount: amount,
          txHash: hash,
        }),
      })
      .then(res => res.json())
      .then(data => {
        toast.dismiss();
        if (data.success) {
          toast.success("SMS with claim link sent!");
        } else {
          toast.error(data.message || "Failed to create transfer record.");
        }
      })
      .catch((err) => {
        toast.dismiss();
        console.error(err);
        toast.error("An error occurred while notifying the recipient.");
      })
      .finally(() => setIsNotifying(false));
    }
  }, [isSuccess, hash, user?.wallet?.address, countryCode, phone, amount]);

  useEffect(() => {
    if (transactionError) {
      console.error("Transaction Error:", transactionError);
      toast.error(transactionError.message);
    }
  }, [transactionError]);
  
  if (!ready) {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-black bg-white p-8 text-center">
        <p>Loading Wallet Status...</p>
      </Card>
    );
  }

  if (!authenticated || !user?.wallet) {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-black bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black uppercase">Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to send money using the button in the top-left corner.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto border-2 border-black bg-white">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-black uppercase">Send Money</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2 text-center">
          <Label htmlFor="amount" className="text-sm font-bold uppercase tracking-wider text-zinc-500">Amount</Label>
          <div className="relative mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-zinc-400">$</span>
            <Input 
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="15.00"
              className="w-56 h-20 after:text-[150px]  font-black text-center pl-12 pr-4 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <Separator className="bg-black" />

        <div className="grid gap-2">
            <Label className="font-bold uppercase tracking-wider text-zinc-500">To</Label>
            <div className="flex items-center space-x-4 rounded-xl border-2 border-black p-2 bg-zinc-100">
              <Avatar className="h-12 w-12 border-2 border-black">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center">
                <CountrySelect value={countryCode} onChange={setCountryCode} />
                <Input 
                    type="tel"
                    placeholder="234 324 7676"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
        </div>

        <div className="grid gap-2">
            <Label className="font-bold uppercase tracking-wider text-zinc-500">From</Label>
             <div className="flex items-center space-x-4 rounded-xl border-2 border-black p-4 bg-zinc-100">
              <Avatar className="h-12 w-12 border-2 border-black">
                <AvatarImage src={`https://avatar.vercel.sh/${user.wallet.address}.png`} />
                <AvatarFallback>
                    {user.wallet.address.slice(2,4)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                    {user.wallet.address.slice(0,6)}...{user.wallet.address.slice(-4)}
                </p>
                <p className="text-sm text-muted-foreground">
                    Connected Wallet
                </p>
              </div>
            </div>
        </div>

        <Button
          className="w-full h-14 text-lg font-bold rounded-full bg-black text-white hover:bg-zinc-800"
          onClick={handleSubmit}
          disabled={isPending || isNotifying || !phone.trim() || !amount}
        >
          {isPending ? "Sending..." : (isNotifying ? "Notifying..." : `Confirm Payment`)}
        </Button>
      </CardContent>
    </Card>
  )
} 