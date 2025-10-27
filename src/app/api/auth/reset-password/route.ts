import { NextRequest, NextResponse } from 'next/server';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com';

interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    
    if (!body.email || !body.code || !body.newPassword || !body.confirmNewPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email, code, newPassword and confirmNewPassword are required' 
      }, { status: 400 });
    }

    const resetRequest: ResetPasswordRequest = {
      email: body.email,
      code: body.code,
      newPassword: body.newPassword,
      confirmNewPassword: body.confirmNewPassword
    };

    
    const response = await fetch(`${API_URL}/api/Auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resetRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        message: data.message || 'Error resetting password' 
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
