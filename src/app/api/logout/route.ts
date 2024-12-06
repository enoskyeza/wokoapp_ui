// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear cookies
    response.cookies.set('authToken', '', {
        path: '/',
        httpOnly: true,
        secure: true,
        expires: new Date(0),
    });
    response.cookies.set('userData', '', {
        path: '/',
        httpOnly: true,
        secure: true,
        expires: new Date(0),
    });

    return response;
}
