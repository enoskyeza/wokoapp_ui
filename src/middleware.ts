import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const userDataCookie = req.cookies.get('userData');
    const authTokenCookie = req.cookies.get('authToken');

    // Check if user has authentication token
    if (!authTokenCookie) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (userDataCookie) {
        try {
            // Parse user data from the cookie
            const user = JSON.parse(userDataCookie.value);

            if (!user.role) {
                return NextResponse.redirect(new URL('/login', req.url));
            }

            // Role-based route restrictions
            const path = req.nextUrl.pathname;

            // Dashboard routes: Only for admin and staff
            if (path.startsWith('/dashboard')) {
                if (user.role !== 'admin' && user.role !== 'staff') {
                    // If judge tries to access dashboard, redirect to judge panel
                    if (user.role === 'judge') {
                        return NextResponse.redirect(new URL('/judge_panel', req.url));
                    }
                    // Other roles go to login
                    return NextResponse.redirect(new URL('/login', req.url));
                }
            }

            // Judge panel routes: Only for judges
            if (path.startsWith('/judge_panel')) {
                if (user.role !== 'judge') {
                    // If admin/staff tries to access judge panel, redirect to dashboard
                    if (user.role === 'admin' || user.role === 'staff') {
                        return NextResponse.redirect(new URL('/dashboard', req.url));
                    }
                    // Other roles go to login
                    return NextResponse.redirect(new URL('/login', req.url));
                }
            }

        } catch (error) {
            // Invalid user data in cookie
            console.error('Middleware error parsing userData:', error);
            return NextResponse.redirect(new URL('/login', req.url));
        }
    } else {
        // No user data cookie found
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next(); // Allow the request
}

export const config = {
    matcher: ['/dashboard/:path*', '/judge_panel/:path*'], // Protected routes
};

// export const config = {
//     matcher: [], // Restricted routes
// };








// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import jwt from 'jsonwebtoken';
// import { use } from 'react';

// const SECRET_KEY = 'your_secret_key';

// export function middleware(req: NextRequest) {
//     console.log('MIDDLEWARE IN ACTION...')
//     const token = req.cookies.get('authToken');
//     console.log("TOKEN: ",token)

//     if (token) {
//         console.log('TOKEN AVAILABLE...')
//         try {
//             console.log("TRY BLOCK RUNNING...", "USER:")
//             const user = jwt.verify(token, SECRET_KEY) as { role: string };
//             console.log("verification results: ", user)
//             // Redirect based on roles
//             if (req.nextUrl.pathname.startsWith('/judge_panel') && user.role !== 'judge') {
//                 return NextResponse.redirect(new URL('/dashboard', req.url));
//             }
//         } catch (error) {
//             console.log("TRY BLOCK FAILED...")
//             return NextResponse.redirect(new URL('/login', req.url));
//         }
//     } else {
//         console.log('TOKEN UNAVAILABLE...')
//         return NextResponse.redirect(new URL('/login', req.url));
//     }

//     return NextResponse.next(); // Allow the request
// }

// export const config = {
//     matcher: ['/dashboard/:path*', '/judge_panel/:path*'], // Restricted routes
// };
