import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const { claimHash } = await request.json();

  if (!claimHash) {
    return NextResponse.json({ success: false, message: 'Claim hash is required' }, { status: 400 });
  }

  try {
    const { data: transfer, error: fetchError } = await supabase
      .from('transfers')
      .select('status')
      .eq('claim_hash', claimHash)
      .single();

    if (fetchError || !transfer) {
      return NextResponse.json({ success: false, message: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.status !== 'funded') {
      return NextResponse.json({ success: false, message: `Transfer already ${transfer.status}` }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('transfers')
      .update({ status: 'claimed' }) // Mark as claimed
      .eq('claim_hash', claimHash);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to claim to card:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 