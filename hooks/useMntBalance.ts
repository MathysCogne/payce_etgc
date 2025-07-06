import { useState, useEffect } from "react";
import { useBalance } from "wagmi";
import { formatUnits } from "viem";

const MNT_COINGECKO_ID = "mantle";
const VS_CURRENCY = "usd";

export function useMntBalanceInUsd(address: `0x${string}` | undefined) {
  const [mntPrice, setMntPrice] = useState<number | null>(null);
  const [balanceInUsd, setBalanceInUsd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
  });

  useEffect(() => {
    async function fetchMntPrice() {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${MNT_COINGECKO_ID}&vs_currencies=${VS_CURRENCY}`
        );
        const data = await response.json();
        if (data[MNT_COINGECKO_ID]?.[VS_CURRENCY]) {
          setMntPrice(data[MNT_COINGECKO_ID][VS_CURRENCY]);
        }
      } catch (error) {
        console.error("Failed to fetch MNT price:", error);
      }
    }

    fetchMntPrice();
  }, []);

  useEffect(() => {
    if (!isBalanceLoading && balanceData && mntPrice !== null) {
      const mntBalance = parseFloat(formatUnits(balanceData.value, balanceData.decimals));
      const usdValue = mntBalance * mntPrice;
      setBalanceInUsd(usdValue.toFixed(2));
      setIsLoading(false);
    } else if (!isBalanceLoading) {
        // Handle case where price might be loading but balance is ready
        setIsLoading(mntPrice === null);
    }
  }, [balanceData, isBalanceLoading, mntPrice]);

  return { balanceInUsd, isLoading };
} 