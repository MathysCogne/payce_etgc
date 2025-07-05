"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSendTransaction, useSwitchChain, useAccount } from "wagmi";
import { parseUnits } from "viem";

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "@/components/custom/CountrySelect";
import { USDC_MANTLE_ADDRESS, SPONSOR_WALLET_ADDRESS } from "@/lib/constants";
import { Toaster, toast } from "sonner";

const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
};

export default function Home() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
      <Header />
      <main className="relative flex flex-col items-center justify-center px-4 py-8 sm:py-16">
        <Toaster richColors />
        <div className="text-center mb-12 sm:mb-16 max-w-4xl mx-auto">
          <Hero />
        </div>

        <div className="w-full max-w-lg mx-auto">
          <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-zinc-700/50 shadow-xl p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
            <div className="relative z-10">
              {ready && authenticated ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Send USDC on Mantle
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Enter an amount and phone number to send USDC to.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-zinc-800 p-2 rounded-lg">
                       <span className="text-lg font-medium pl-2">USD</span>
                       <Input
                         placeholder="0.00"
                         value={amount}
                         onChange={(e) => setAmount(e.target.value)}
                         className="h-11 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-right"
                         type="number"
                       />
                    </div>
                    <div className="flex gap-3">
                      <div className="w-24 flex-shrink-0">
                        <CountrySelect value={countryCode} onChange={setCountryCode} />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Phone Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-11 text-base"
                          type="tel"
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                      onClick={handleSubmit}
                      disabled={isPending || isNotifying || !phone.trim() || !amount}
                    >
                      {isPending ? "Sending..." : (isNotifying ? "Notifying..." : `Send ${amount || '0.00'} USDC`)}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                   <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Connect to Start
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Please connect your wallet to send money.
                  </p>
                  <Button 
                      className="h-12 text-base font-semibold"
                      onClick={() => toast.info("Please use the 'Connect' button in the header.")}
                    >
                     Connect Wallet
                    </Button>
                </div>
              )}
              <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 text-center font-medium">
                  🎉 No wallet required for the recipient!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
