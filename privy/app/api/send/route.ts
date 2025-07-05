import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { Database } from '@/lib/database.types';

const sendSchema = z.object({
  phone: z.string().min(10),
  amount: z.number().positive(),
  burnTxHash: z.string().startsWith('0x'),
  senderDid: z.string(),
});

export async function POST(request: Request) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const body = await request.json();
  const validation = sendSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request body', issues: validation.error.issues }, { status: 400 });
  }

  const { phone, amount, burnTxHash, senderDid } = validation.data;

  try {
    // Upsert the sender to ensure they exist in the users table
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({ privy_did: senderDid }, { onConflict: 'privy_did' });

    if (upsertError) throw upsertError;

    const { data: recipientUser } = await supabase
      .from('users')
      .select('privy_did')
      .eq('phone_number', phone)
      .single();

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        tx_hash: burnTxHash,
        sender_did: senderDid,
        recipient_phone_number: phone,
        recipient_did: recipientUser?.privy_did || null,
        amount: amount,
        status: 'pending',
      })
      .select()
      .single();

    if (txError) {
      throw txError;
    }

    return NextResponse.json({ message: 'Transaction initiated successfully!', transaction });

  } catch (error: any) {
    console.error('Error initiating transaction:', error);
    return NextResponse.json({ error: 'Failed to initiate transaction', details: error.message }, { status: 500 });
  }
} 