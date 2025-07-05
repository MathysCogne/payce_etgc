import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createWalletClient, http, createPublicClient, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { USDC_MANTLE_ADDRESS } from '../../../lib/constants';
import { erc20Abi } from '../../../lib/erc20abi';

const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
};

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const { claimHash, recipientAddress } = await request.json();

  if (!claimHash || !recipientAddress) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data: transfer, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('claim_hash', claimHash)
      .single();

    if (error || !transfer) {
      return NextResponse.json({ success: false, message: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.status === 'claimed') {
      return NextResponse.json({ success: false, message: 'Transfer already claimed' }, { status: 400 });
    }
    if (transfer.status !== 'funded') {
        return NextResponse.json({ success: false, message: 'Transfer not yet funded' }, { status: 400 });
    }
    
    // In production, you MUST verify the user's identity here.

    const privateKey = process.env.SPONSOR_WALLET_PRIVATE_KEY;
    if (!privateKey) throw new Error('Sponsor wallet private key not configured');
    
    const account = privateKeyToAccount(`0x${privateKey}`);
    
    const walletClient = createWalletClient({
      account,
      chain: mantleSepolia,
      transport: http(),
    });

    const publicClient = createPublicClient({
        chain: mantleSepolia,
        transport: http()
    })

    const amountInUnits = parseUnits(transfer.amount.toString(), 6);

    const txHash = await walletClient.writeContract({
        address: USDC_MANTLE_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipientAddress, amountInUnits],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash })

    const { error: updateError } = await supabase
      .from('transfers')
      .update({ status: 'claimed', claim_tx_hash: txHash })
      .eq('claim_hash', claimHash);

    if (updateError) {
        console.error("Failed to update transfer status:", updateError)
        // If this fails, we need manual intervention. The transfer happened.
    }

    return NextResponse.json({ success: true, txHash });

  } catch (error) {
    console.error('Failed to execute claim:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 