/// <reference types="@rsbuild/core/types" />

export interface Props {
    modelValue?: string;
    error?: string | null;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    autocomplete?: string;
}
export interface LoginPayload {
    username: string;
    password: string;
    client_id?: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: {
        username: string;
        display_name: string;
    };
}
export interface DataResponse {
    success: boolean;
    user_auth: {
        client_id: string;
        username: string;
        display_name: string;
    };
    data: {
        display_name: string;
        username: string;
    };
}