import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

import {
  ARBITRUM_SEPOLIA_MESSAGE_TRANSMITTER_ADDRESS,
  MESSAGE_TRANSMITTER_ABI,
  APP_HOLDING_WALLET_ADDRESS,
  ARBITRUM_SEPOLIA_USDC_ADDRESS,
  USDC_ABI
} from '@/lib/constants';
import { Database } from '@/lib/database.types';

export async function POST(request: Request) {
  const { message, attestation, claimerAddress, txHash } = await request.json();

  if (!message || !attestation || !claimerAddress || !txHash) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const serverPrivateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
  const depositPrivateKey = process.env.DEPOSIT_WALLET_PRIVATE_KEY;

  if (!serverPrivateKey || !depositPrivateKey) {
    return NextResponse.json({ error: 'Server wallets not configured' }, { status: 500 });
  }

  // Provider and signer for Arbitrum Sepolia
  const arbProvider = new ethers.providers.JsonRpcProvider(`https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
  const serverSigner = new ethers.Wallet(serverPrivateKey, arbProvider);
  const depositSigner = new ethers.Wallet(depositPrivateKey, arbProvider);

  const messageTransmitterContract = new ethers.Contract(ARBITRUM_SEPOLIA_MESSAGE_TRANSMITTER_ADDRESS, MESSAGE_TRANSMITTER_ABI, serverSigner);
  const usdcContractOnArb = new ethers.Contract(ARBITRUM_SEPOLIA_USDC_ADDRESS, USDC_ABI, depositSigner);
  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  try {
    // 1. Backend calls receiveMessage to mint funds into the app's holding wallet
    const receiveTx = await messageTransmitterContract.receiveMessage(message, attestation, {
      gasLimit: 500000 // Provide a generous gas limit
    });
    await receiveTx.wait();
    
    // 2. Backend transfers the minted funds from the holding wallet to the final user
    const transaction = await supabase.from('transactions').select('amount').eq('tx_hash', txHash).single();
    if (transaction.error || !transaction.data) throw new Error('Transaction not found in DB');
    
    const amountToTransfer = ethers.utils.parseUnits(transaction.data.amount.toString(), 6);
    
    const transferTx = await usdcContractOnArb.transfer(claimerAddress, amountToTransfer);
    await transferTx.wait();

    // 3. Update transaction status in DB
    await supabase.from('transactions').update({ status: 'claimed' }).eq('tx_hash', txHash);

    return NextResponse.json({ message: 'Funds successfully claimed and transferred!', finalTxHash: transferTx.hash });

  } catch (error: any) {
    console.error('Claim Error:', error);
    return NextResponse.json({ error: 'Failed to claim funds', details: error.message }, { status: 500 });
  }
} 