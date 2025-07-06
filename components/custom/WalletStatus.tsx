"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, Copy, Download, DollarSign, Gem } from "lucide-react";
import { toast } from "sonner";
import { useMntBalanceInUsd } from "@/hooks/useMntBalance";
import { useUsdcBalance } from "@/hooks/useUsdc";
import type { User } from "@privy-io/react-auth";

// Helper to get social profile picture
const getSocialAvatar = (user: User | null) => {
  const socialAccount = user?.linkedAccounts.find(
    (account) => account.type !== "wallet" && 'profilePictureUrl' in account
  );
  if (socialAccount && 'profilePictureUrl' in socialAccount) {
    return socialAccount.profilePictureUrl;
  }
  return null;
}

export function WalletStatus() {
  const {
    ready,
    authenticated,
    login,
    logout,
    user,
    exportWallet,
  } = usePrivy();

  const walletAddress = user?.wallet?.address as `0x${string}` | undefined;

  const { balanceInUsd, isLoading: isMntBalanceLoading } = useMntBalanceInUsd(walletAddress);
  const { formattedBalance: usdcBalance, loading: isUsdcBalanceLoading } = useUsdcBalance(walletAddress);

  const avatarSrc = getSocialAvatar(user) || `https://avatar.vercel.sh/${user?.wallet?.address}.png`;

  const copyAddress = () => {
    if (user?.wallet?.address) {
      navigator.clipboard.writeText(user.wallet.address);
      toast.success("Address copied to clipboard!");
    }
  };

  if (!ready) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button disabled className="h-12 rounded-full bg-zinc-900 text-white">
          Loading...
        </Button>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={login}
          className="h-12 rounded-full bg-black text-white hover:bg-zinc-800 text-md font-bold"
        >
          <LogIn className="mr-2 h-5 w-5" />
          Connect
        </Button>
      </div>
    );
  }

  // This check ensures user is not null for the rest of the component
  if (!user) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-12 rounded-full bg-white border-2 border-black"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>
                  {user.wallet?.address.slice(2, 4)}
                </AvatarFallback>
              </Avatar>
              <span className="font-mono font-bold">
                {isUsdcBalanceLoading ? "..." : `$${usdcBalance} `}
                <span className="text-xs text-zinc-500 font-mono">
                  {"USDC"}
                </span>
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="border-2 border-black w-64 shadow-[4px_4px_0px_#000]"
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>My Wallet</span>
              <span className="text-xs text-zinc-500 font-mono">
                {user.wallet?.address.slice(0, 6)}...
                {user.wallet?.address.slice(-4)}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuGroup>
                <DropdownMenuItem disabled>
                    <div className="flex justify-between w-full items-center">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <DollarSign className="h-4 w-4" />
                            <span>USDC</span>
                        </div>
                        <span className="font-bold">{isUsdcBalanceLoading ? '...' : `$${usdcBalance}`}</span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <div className="flex justify-between w-full items-center">
                       <div className="flex items-center gap-2 text-zinc-500">
                            <Gem className="h-4 w-4" />
                            <span>MNT</span>
                        </div>
                        <span className="font-bold">{isMntBalanceLoading ? '...' : `$${balanceInUsd}`}</span>
                    </div>
                </DropdownMenuItem>
           </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={copyAddress}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportWallet}>
              <Download className="mr-2 h-4 w-4" />
              <span>Export Wallet</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 