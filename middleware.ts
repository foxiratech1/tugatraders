import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get('accessToken')?.value;

    if (accessToken) {
        try {
            const base64Url = accessToken.split('.')[1];
            if (base64Url) {
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                // Decode base64 to string
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const decoded = JSON.parse(jsonPayload);
                const role = (decoded?.role || decoded?.user?.role || '').toLowerCase();

                const isEmailVerified = decoded?.isEmailVerified ?? decoded?.user?.isEmailVerified;

                // Redirect logged-in Trader away from public pages
                if (role === 'trader') {
                    // Allow access to onboarding steps, block only the initial signup/login pages
                    const isAuthPage = pathname === '/auth/trader-login' || pathname === '/auth/trader-signup';
                    if (isAuthPage) {
                        if (isEmailVerified !== true) {
                            return NextResponse.redirect(new URL('/auth/verify-otp', request.url));
                        }
                        return NextResponse.redirect(new URL('/trader', request.url));
                    }
                }

                // Similar check could be done for Customer if needed
                // if (role === 'customer') {
                //   if (pathname.startsWith('/auth/customer-')) {
                //     return NextResponse.redirect(new URL('/', request.url));
                //   }
                // }
            }
        } catch (e) {
            // Ignore token parse errors in middleware, let client handle expiry
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
