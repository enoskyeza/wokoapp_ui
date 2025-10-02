// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear cookies - match the settings from login page
    response.cookies.set('authToken', '', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });
    response.cookies.set('userData', '', {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0),
    });

    return response;
}
