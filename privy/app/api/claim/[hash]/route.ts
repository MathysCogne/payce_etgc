import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

export async function GET(
  request: Request,
  context: { params: { hash: string } }
) {
  const hash = context.params.hash;
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, sender_did, status')
      .eq('tx_hash', hash)
      .single();

    if (error || !data) {
      throw new Error('Transaction not found.');
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}


export async function POST(
  request: Request,
  context: { params: { hash: string } }
) {
  const hash = context.params.hash;
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Since we are not using server-side auth, we need to get user info from the client.
  // This is NOT secure for production, but it's okay for our POC.
  // The client will need to send the privy_did in the POST body.
  const { privyDid, userWalletAddress } = await request.json();

  if (!privyDid || !userWalletAddress) {
    return NextResponse.json({ error: 'Missing user details in request body' }, { status: 400 });
  }

  try {
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('status, recipient_phone_number')
      .eq('tx_hash', hash)
      .single();

    if (txError || !transaction) {
      throw new Error('Transaction not found.');
    }
    if (transaction.status !== 'pending') {
      throw new Error(`Transaction is already ${transaction.status}.`);
    }

    const { error: updateUserError } = await supabase
      .from('users')
      .upsert(
        { privy_did: privyDid, phone_number: transaction.recipient_phone_number, wallet_address: userWalletAddress },
        { onConflict: 'privy_did' }
      );
    if (updateUserError) throw updateUserError;

    // TODO: On-chain transfer logic goes here

    const { error: updateError } = await supabase
      .from('transactions')
      .update({ status: 'claimed', recipient_did: privyDid, claimed_at: new Date().toISOString() })
      .eq('tx_hash', hash);
    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Transaction claimed successfully!' });

  } catch (error: any) {
    console.error('Claiming error:', error);
    return NextResponse.json({ error: 'Failed to claim transaction', details: error.message }, { status: 500 });
  }
} 