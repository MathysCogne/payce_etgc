import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import 'dotenv/config';

import {
  ARBITRUM_SEPOLIA_MESSAGE_TRANSMITTER_ADDRESS,
  MESSAGE_TRANSMITTER_ABI,
} from '@/lib/constants';

export async function POST(request: Request) {
  const { message, attestation } = await request.json();

  if (!message || !attestation) {
    return NextResponse.json({ error: 'Missing message or attestation' }, { status: 400 });
  }

  const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: 'Server wallet not configured' }, { status: 500 });
  }

  // We need a provider for the DESTINATION chain (Arbitrum Sepolia)
  const arbProvider = new ethers.providers.JsonRpcProvider(`https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
  const signer = new ethers.Wallet(privateKey, arbProvider);
  const messageTransmitterContract = new ethers.Contract(ARBITRUM_SEPOLIA_MESSAGE_TRANSMITTER_ADDRESS, MESSAGE_TRANSMITTER_ABI, signer);

  try {
    const receiveTx = await messageTransmitterContract.receiveMessage(message, attestation);
    const txReceipt = await receiveTx.wait();

    // The funds are now in the APP_HOLDING_WALLET_ADDRESS on Arbitrum Sepolia.
    // The next step would be to transfer them from the holding wallet to the final user.
    // For this POC, we'll stop here and consider the minting successful.

    return NextResponse.json({ message: 'Minting transaction successful!', txHash: txReceipt.transactionHash });
  } catch (error: any) {
    console.error('CCTP Mint Error:', error);
    return NextResponse.json({ error: 'Failed to execute CCTP mint', details: error.message }, { status: 500 });
  }
} 