export async function sendSMS(phone: string, message: string) {
  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        phone,
        message,
        key: process.env.TEXTBELT_API_KEY || '',
      }),
    });

    const data = await response.json();
    
    if (!data.success) {
      // Log the detailed error from Textbelt but throw a generic error
      console.error('Textbelt error:', data.error);
      throw new Error('Failed to send SMS via external provider.');
    }

    return data;

  } catch (error) {
    console.error('Error sending SMS:', error);
    // Re-throw the error to be caught by the calling API route
    throw error;
  }
}

// The function to generate a verification code seems to have been removed.
// If you need it again, it can be re-added here.
// export const generateVerificationCode = () => { ... };