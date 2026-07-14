import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Matcher for public authentication routes
export const config = {
  matcher: ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/trader-signup'],
};

/**
 * Parses a JWT payload safely in the Edge runtime
 */
function parseJwtEdge(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // atob is globally available in the Edge runtime
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT in middleware:", error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;

  // If a token exists, the user is authenticated. We shouldn't let them access public auth pages.
  if (token) {
    const decoded = parseJwtEdge(token);

    // Validate token expiration if possible
    if (decoded && decoded.exp * 1000 > Date.now()) {
      // Determine the user role for routing
      const roleStr = (decoded.role || decoded.user?.role || "").toString().toLowerCase();

      let dashboardUrl = '/';

      if (roleStr === 'trader') {
        dashboardUrl = '/trader';
      } else if (roleStr === 'admin') {
        dashboardUrl = '/admin';
      } else if (roleStr === 'customer') {
        dashboardUrl = '/customer-dashboard/jobs';
      }

      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }
  }

  // If no valid token exists, allow them to view the auth page
  return NextResponse.next();
}
