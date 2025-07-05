import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

export async function POST(
  request: Request,
  context: { params: { hash: string } }
) {
  const hash = context.params.hash;
  const { privyDid, userWalletAddress } = await request.json();

  if (!privyDid || !userWalletAddress) {
    return NextResponse.json({ error: 'Missing user details' }, { status: 400 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Associate the user's privy DID with their phone number in the users table
    const { data: transactionDetails } = await supabase
      .from('transactions')
      .select('recipient_phone_number')
      .eq('tx_hash', hash)
      .single();

    if (transactionDetails) {
      await supabase
        .from('users')
        .upsert(
          { privy_did: privyDid, phone_number: transactionDetails.recipient_phone_number, wallet_address: userWalletAddress },
          { onConflict: 'privy_did' }
        );
    }
    
    // Update the transaction to 'claimed'
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ status: 'claimed', recipient_did: privyDid, claimed_at: new Date().toISOString() })
      .eq('tx_hash', hash);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Transaction status updated successfully!' });

  } catch (error: any) {
    console.error('DB Update Error:', error);
    return NextResponse.json({ error: 'Failed to update transaction status', details: error.message }, { status: 500 });
  }
} 