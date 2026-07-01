import { Role } from "./role";

export interface DecodedToken {
  exp: number;
  iat: number;
  role?: Role;
  id?: string;
  [key: string]: any;
}

export const parseJwt = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
};

export const setTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  }
};

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
};

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

export const getUserRole = (): Role | null => {
  const token = getAccessToken();
  if (!token) return null;
  const decoded = parseJwt(token);
  const role = decoded?.role;
  if (!role) return null;
  // Normalize role to lowercase to match Role enum values
  const normalized = typeof role === 'string' ? role.toLowerCase() : role;
  return (Object.values(Role) as string[]).includes(normalized) ? (normalized as Role) : null;
};
