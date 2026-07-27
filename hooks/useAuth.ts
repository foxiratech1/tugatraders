"use client";

import { useState, useEffect } from "react";
import { getAccessToken, parseJwt, getUserRole, getUser } from "@/utils/auth";
import { Role } from "@/utils/role";

export interface AuthState {
  isAuthenticated: boolean;
  role: Role | null;
  user: any | null;
}

/**
 * Lightweight hook that checks whether the current visitor
 * is authenticated and determines their role based on localStorage tokens.
 *
 * - No API calls — reads accessToken + user from localStorage.
 * - Validates token expiry.
 * - Safe for SSR (returns unauthenticated until mounted).
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null,
  });

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setState({ isAuthenticated: false, role: null, user: null });
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded || decoded.exp * 1000 <= Date.now()) {
      // Token expired or invalid
      setState({ isAuthenticated: false, role: null, user: null });
      return;
    }

    const role = getUserRole();
    const user = getUser();

    setState({
      isAuthenticated: true,
      role: role,
      user,
    });
  }, []);

  return state;
}
