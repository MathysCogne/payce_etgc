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

    const res = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        phone,
        message,
        key: '3ddede00ac34894e706dd2bfb92ea1cc5740d18bY5ml9SgcrL9tnfYCVs7CHtKTc',
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