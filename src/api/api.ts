import axios from "axios";
import {getToken, getSecurityToken, setSecurityToken, CLIENT_ID} from "./token";
import type { DataResponse, LoginPayload, LoginResponse } from "./types/api";

const GATEWAY_URL = import.meta.env.PUBLIC_GATEWAY_PROXY || "http://localhost:5000";

export const apiClient = axios.create({
    baseURL: GATEWAY_URL,
    headers: {
        "Content-Type": "application/json",
        "x-client-origin": "http://localhost:3000"
    }
});
export async function fetchSecurityToken(): Promise<string> {
    const response = await axios.get<{ success: boolean; security_token: string }>(`${GATEWAY_URL}/api/security/token`, {
        headers: {
            "x-client-origin": "http://localhost:3000"
        }
    });
    const secToken = response.data.security_token;
    setSecurityToken(secToken);
    return secToken;
}

apiClient.interceptors.request.use(async (config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.url?.includes("/api/security/token")) {
        let secToken = getSecurityToken();
        if (!secToken) {
            try {
                secToken = await fetchSecurityToken();
            } catch (err) {
                console.warn("Gagal mengambil security token otomatis:", err);
            }
        }
        if (secToken) {
            config.headers["x-security-token"] = secToken;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
    if (!getSecurityToken()) {
        await fetchSecurityToken();
    }

    const response = await apiClient.post<LoginResponse>("/api/login", {
        username: payload.username,
        password: payload.password,
        client_id: payload.client_id || CLIENT_ID
    });
    return response.data;
}

export async function fetchUserData(): Promise<DataResponse> {
    const response = await apiClient.get<DataResponse>("/api/data");
    return response.data;
}