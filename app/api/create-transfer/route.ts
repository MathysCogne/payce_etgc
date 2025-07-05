import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/sms';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const { senderAddress, recipientPhone, amount, txHash } = await request.json();

  if (!senderAddress || !recipientPhone || !amount || !txHash) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
  }
  
  // TODO: In production, verify the txHash on-chain here!
  // This is a critical security step to ensure the sponsor wallet was actually funded.

  const claim_hash = randomUUID();

  const { error } = await supabase
    .from('transfers')
    .insert([
      { 
        sender_address: senderAddress, 
        recipient_phone_number: recipientPhone, 
        amount, 
        initial_tx_hash: txHash,
        claim_hash: claim_hash,
        status: 'funded',
      }
    ]);

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  
  const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL}/claim/${claim_hash}`;
  const smsMessage = `You have received ${amount} USDC. Click here to claim: ${claimUrl}`;

  try {
    await sendSMS(recipientPhone, smsMessage);
    return NextResponse.json({ success: true, claimHash: claim_hash });
  } catch (smsError) {
    console.error('Failed to send SMS:', smsError);
    // Even if SMS fails, the transfer is created. Log the error.
    return NextResponse.json({ success: true, claimHash: claim_hash, warning: 'SMS failed to send' });
  }
} 