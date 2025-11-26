import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gr4-swp-be2-sp25.onrender.com/api";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    console.log('[Payment API] Request body:', body);
    
    // Validate required fields for subscription payment
    if (body.planID && !body.vehicleID) {
      return NextResponse.json(
        { success: false, message: "vehicleID is required for subscription payment" },
        { status: 400 }
      );
    }
    
    // Backend expects query parameters (not body)
    const queryParams = new URLSearchParams({
      vehicleID: body.vehicleID,
      planID: body.planID,
    });
    
    const backendUrl = `${API_URL}/payment?${queryParams.toString()}`;
    console.log('[Payment API] Backend URL:', backendUrl);
    
    // Forward to backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    console.log('[Payment API] Backend response status:', response.status);
    console.log('[Payment API] Backend response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Payment failed", errors: data.errors },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
