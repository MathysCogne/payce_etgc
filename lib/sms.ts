export async function sendSMS(phone: string, message: string) {
  const form = new URLSearchParams({
    to: phone.replace(/\D/g, ''), // Clean the phone number
    text: message,
    p: process.env.SMS77_API_KEY || '',
    json: '1',
  });

  try {
    const res = await fetch('https://gateway.sms77.io/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });

    const data = await res.json();
    if (data.success !== '100') {
      console.error('sms77 error:', data);
      throw new Error('Failed to send SMS via sms77.io');
    }
    
    console.log('SMS sent successfully via sms77.io', data);
    return data;
  } catch (err) {
    console.error('Error sending SMS via sms77:', err);
    throw err;
  }
}

/**
 * This function is kept to resolve an import error on an unused page.
 * The core OTP logic is handled in the `/api/send-otp` route.
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}