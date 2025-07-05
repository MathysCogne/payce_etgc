import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createWalletClient, http, createPublicClient, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { USDC_MANTLE_ADDRESS } from '../../../lib/constants';
import { erc20Abi } from '../../../lib/erc20abi';
import { createHmac } from 'crypto';

const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
};

function hashOtp(otp: string) {
  const secret = process.env.OTP_SECRET || 'default-secret-for-hackathon';
  return createHmac('sha256', secret).update(otp).digest('hex');
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const { claimHash, recipientAddress, otpCode } = await request.json();

  if (!claimHash || !recipientAddress || !otpCode) {
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
    
    // --- OTP Verification ---
    if (!transfer.otp_hash || !transfer.otp_expires_at) {
        return NextResponse.json({ success: false, message: 'No OTP was requested for this transfer.' }, { status: 400 });
    }
    if (new Date(transfer.otp_expires_at) < new Date()) {
        return NextResponse.json({ success: false, message: 'The verification code has expired. Please request a new one.' }, { status: 400 });
    }
    const userOtpHash = hashOtp(otpCode);
    if (userOtpHash !== transfer.otp_hash) {
        return NextResponse.json({ success: false, message: 'Invalid verification code.' }, { status: 400 });
    }
    // --- End OTP Verification ---

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
      .update({ status: 'claimed', claim_tx_hash: txHash, otp_hash: null, otp_expires_at: null }) // Clear OTP after use
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