export async function sendSMS(phone: string, message: string) {
  try {
    const res = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone,
        message: message,
        key: process.env.TEXTBELT_API_KEY || 'textbelt', // Utilise la clé de test par défaut si non définie
      }),
    });

    const data = await res.json();
    if (!data.success) {
      console.error('Textbelt error:', data);
      throw new Error(`Failed to send SMS via Textbelt: ${data.error || 'Unknown error'}`);
    }
    
    console.log('SMS sent successfully via Textbelt', data);
    return data;
  } catch (err) {
    console.error('Error sending SMS via Textbelt:', err);
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