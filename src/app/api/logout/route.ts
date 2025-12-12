// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
    console.log('🔴 Logout API called');
    
    const response = NextResponse.json({ 
        success: true,
        message: 'Logged out successfully'
    });

    // Clear cookies - match the settings from login (no httpOnly)
    response.cookies.set('authToken', '', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
    });
    
    response.cookies.set('userData', '', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
    });

    console.log('✅ Cookies cleared');
    return response;
}
