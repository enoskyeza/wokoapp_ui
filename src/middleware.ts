import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const userDataCookie = req.cookies.get('userData');

    if (userDataCookie) {
        try {
            // Parse user data from the cookie
            const user = JSON.parse(userDataCookie.value);

            if (!user.role) {
                return NextResponse.redirect(new URL('/', req.url));
            }

            // Restrict routes based on roles
            if (req.nextUrl.pathname.startsWith('/judge_panel') && user.role !== 'judge') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
        } catch {
            return NextResponse.redirect(new URL('/', req.url));
        }
    } else {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next(); // Allow the request
}

export const config = {
    matcher: ['/dashboard/:path*', '/judge_panel/:path*'], // Restricted routes
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
