import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    // Vérifier que la clé API est configurée
    const apiKey = process.env.TEXTBELT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SMS service not configured' },
        { status: 500 }
      );
    }

    const res = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        phone,
        message,
        key: apiKey,
      }),
    });

    const data = await res.json();
    
    if (data.success) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json(
        { error: 'Failed to send SMS', details: data },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}