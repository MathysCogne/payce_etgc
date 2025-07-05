'use client';

import { useState } from 'react';
import { createWalletClient, http, encodeFunctionData, Hex, parseUnits, createPublicClient, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia, arbitrumSepolia } from 'viem/chains';
import { createClient } from '@supabase/supabase-js';

import {
  CHAIN_IDS_TO_USDC_ADDRESSES,
  CHAIN_IDS_TO_TOKEN_MESSENGER,
  CHAIN_IDS_TO_MESSAGE_TRANSMITTER,
  DESTINATION_DOMAINS,
  IRIS_API_URL,
} from '@/lib/cctp_chains'; // We will create this file next
import { TOKEN_MESSENGER_ABI, USDC_ABI, MESSAGE_TRANSMITTER_ABI } from '@/lib/cctp_abis'; // We will create this file next
import { Database } from '@/lib/database.types';

export type TransferStep = 'idle' | 'approving' | 'burning' | 'waiting-attestation' | 'minting' | 'completed' | 'error';

const chains = {
  [sepolia.id]: sepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
};

export function usePayce() {
  const [currentStep, setCurrentStep] = useState<TransferStep>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [burnTxHash, setBurnTxHash] = useState<Hex | null>(null);

  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  const addLog = (message: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);

  const getPrivateKey = () => {
    const evmKey = process.env.NEXT_PUBLIC_EVM_PRIVATE_KEY;
    if (!evmKey) throw new Error('EVM private key not found in environment variables.');
    // Ensure the key is a hex string
    return evmKey.startsWith('0x') ? (evmKey as Hex) : (`0x${evmKey}` as Hex);
  };

  const getEVMClient = (chainId: keyof typeof chains) => {
    const privateKey = getPrivateKey();
    const account = privateKeyToAccount(privateKey);
    return createWalletClient({ chain: chains[chainId], transport: http(), account });
  };

  const executeTransfer = async (recipientPhoneNumber: string, amount: string, senderDid: string) => {
    try {
      setCurrentStep('approving');
      addLog('Initiating transfer...');
      const sourceChainId = sepolia.id;
      const destinationChainId = arbitrumSepolia.id;
      const amountBigInt = parseUnits(amount, 6);
      
      const client = getEVMClient(sourceChainId);
      const mintRecipient = process.env.NEXT_PUBLIC_APP_HOLDING_WALLET_ADDRESS as Hex;
      if (!mintRecipient) throw new Error('Holding wallet address not configured.');

      addLog('Approving USDC spend...');
      await client.sendTransaction({
        to: getAddress(CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId] as Hex),
        data: encodeFunctionData({
          abi: USDC_ABI,
          functionName: 'approve',
          args: [getAddress(CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId] as Hex), amountBigInt],
        }),
      });
      addLog('Approval sent.');

      setCurrentStep('burning');
      addLog('Burning USDC...');
      const mintRecipientBytes32 = `0x${mintRecipient.replace(/^0x/, "").padStart(64, "0")}` as Hex;
      
      const burnTx = await client.sendTransaction({
        to: getAddress(CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId] as Hex),
        data: encodeFunctionData({
          abi: TOKEN_MESSENGER_ABI,
          functionName: 'depositForBurn',
          args: [
            amountBigInt,
            DESTINATION_DOMAINS[destinationChainId],
            mintRecipientBytes32,
            getAddress(CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId] as Hex),
            `0x${'0'.repeat(64)}`, // destinationCaller
            BigInt(0), // maxFee
            2000, // minFinalityThreshold
          ],
        }),
      });
      addLog(`Burn transaction sent: ${burnTx}`);
      setBurnTxHash(burnTx);

      // Save to DB
      await supabase.from('users').upsert({ privy_did: senderDid }, { onConflict: 'privy_did' });
      await supabase.from('transactions').insert({
        tx_hash: burnTx,
        sender_did: senderDid,
        recipient_phone_number: recipientPhoneNumber,
        amount: Number(amount),
        status: 'pending',
      });
      addLog('Transaction saved to database.');
      
      setCurrentStep('waiting-attestation');
      addLog('Waiting for Circle attestation...');
      let attestationResponse: any = {};
      while (attestationResponse.status !== 'complete') {
        const res = await fetch(`${IRIS_API_URL}/v1/attestations/${burnTx}`);
        const data = await res.json();
        attestationResponse = data;
        await new Promise(r => setTimeout(r, 2000));
      }
      addLog('Attestation received!');

      setCurrentStep('minting');
      addLog('Minting USDC on destination chain...');
      const mintingClient = getEVMClient(destinationChainId);
      const mintTx = await mintingClient.sendTransaction({
        to: CHAIN_IDS_TO_MESSAGE_TRANSMITTER[destinationChainId] as Hex,
        data: encodeFunctionData({
          abi: MESSAGE_TRANSMITTER_ABI,
          functionName: 'receiveMessage',
          args: [attestationResponse.message, attestationResponse.attestation],
        }),
      });
      addLog(`Mint transaction sent: ${mintTx}`);
      
      // Final transfer from holding wallet can be done here or in a separate step
      // For POC, we'll consider this the end.
      
      setCurrentStep('completed');
      addLog('Transfer complete!');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred.');
      setCurrentStep('error');
    }
  };

  const reset = () => {
    setCurrentStep('idle');
    setLogs([]);
    setError(null);
    setBurnTxHash(null);
  };
  
  return { currentStep, logs, error, executeTransfer, burnTxHash, reset };
} 