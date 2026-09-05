export interface JwtPayload {
    client_id: string;
    username: string;
    display_name: string;
    iat?: number;
    exp?: number;
}

export interface SecurityTokenPayload {
    client_id: string;
    nonce: string;
    iat: number;
    exp: number;
}

export const CLIENT_ID = "login-app";

export const TOKEN_KEY = "auth_token";
export const SECURITY_TOKEN_KEY = "security_token";

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

export function getSecurityToken(): string | null {
    return localStorage.getItem(SECURITY_TOKEN_KEY);
}

export function setSecurityToken(token: string): void {
    localStorage.setItem(SECURITY_TOKEN_KEY, token);
}

export function removeSecurityToken(): void {
    localStorage.removeItem(SECURITY_TOKEN_KEY);
}

export function decodeToken(token?: string | null): JwtPayload | null {
    const rawToken = token || getToken();
    if (!rawToken) return null;

    try {
        const parts = rawToken.split(".");
        if (parts.length !== 3) return null;
        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(payloadBase64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
        return null;
    }
}

export function decodeSecurityToken(token?: string | null): SecurityTokenPayload | null {
    const rawToken = token || getSecurityToken();
    if (!rawToken) return null;

    try {
        const parts = rawToken.split(".");
        if (parts.length !== 2) return null;
        const payloadBase64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(payloadBase64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload) as SecurityTokenPayload;
    } catch {
        return null;
    }
}

export function isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;

    const payload = decodeToken(token);
    if (!payload) return false;

    // Pastikan parameter client_id ada dan sesuai
    if (payload.client_id !== CLIENT_ID) return false;

    // Periksa apakah token sudah expired jika exp ada
    if (payload.exp && payload.exp * 1000 < Date.now()) {
        removeToken();
        return false;
    }

    return true;
}