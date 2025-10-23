import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ForgotPasswordRequest {
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email is required' 
      }, { status: 400 });
    }

    const forgotRequest: ForgotPasswordRequest = {
      email: body.email
    };

    const response = await fetch(`${API_URL}/api/Auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        message: data.message || 'Error sending reset code' 
      }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error connecting to server' 
    }, { status: 500 });
  }
}
