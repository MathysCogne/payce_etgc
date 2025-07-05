import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/sms';
import { createHmac } from 'crypto';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string) {
  const secret = process.env.OTP_SECRET || 'default-secret-for-hackathon';
  return createHmac('sha256', secret).update(otp).digest('hex');
}

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const { claimHash } = await request.json();

  if (!claimHash) {
    return NextResponse.json({ success: false, message: 'Claim hash is required' }, { status: 400 });
  }

  const { data: transfer, error } = await supabase
    .from('transfers')
    .select('recipient_phone_number, status')
    .eq('claim_hash', claimHash)
    .single();

  if (error || !transfer) {
    return NextResponse.json({ success: false, message: 'Transfer not found.' }, { status: 404 });
  }

  if (transfer.status !== 'funded') {
    return NextResponse.json({ success: false, message: `Transfer is already ${transfer.status}.` }, { status: 400 });
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  const { error: updateError } = await supabase
    .from('transfers')
    .update({ otp_hash: otpHash, otp_expires_at: otpExpiresAt.toISOString() })
    .eq('claim_hash', claimHash);

  if (updateError) {
    return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
  }

  try {
    await sendSMS(transfer.recipient_phone_number, `Your Payce verification code is: ${otp}. It will expire in 10 minutes.`);
    return NextResponse.json({ success: true });
  } catch (smsError) {
    console.error('Failed to send OTP SMS:', smsError);
    return NextResponse.json({ success: false, message: 'Failed to send verification code.' }, { status: 500 });
  }
} 