import { api } from "../lib/api";
import type { LoginCredentials, MessageResponse, ResetCredentials, ResetPassCredentials, SignupCredentials, SignupResponse, UserProfile } from "../types/auth.types";

const AUTH_PREFIX = '/api/v1/auth';

export const loginApi = async (credentials: LoginCredentials): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(`${AUTH_PREFIX}/login`, credentials);
    return response.data;
};

export const getMeApi = async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`${AUTH_PREFIX}/me`);
    return response.data;
};

export const signupApi = async (credentials: SignupCredentials): Promise<SignupResponse> => {
    const response = await api.post<SignupResponse>(`${AUTH_PREFIX}/signup`, credentials);
    return response.data;
};

export const resendVerifyApi = async (credentials: ResetCredentials): Promise<SignupResponse> => {
    const response = await api.post<SignupResponse>(`${AUTH_PREFIX}/resend-verification`, credentials);
    return response.data;
};

export const forgotPassApi = async (credentials: ResetCredentials): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(`${AUTH_PREFIX}/forgot-password`, credentials);
    return response.data;
};

export const resetPassApi = async (credentials: ResetPassCredentials): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(`${AUTH_PREFIX}/reset-password`, credentials);
    return response.data;
};

export const logoutApi = async (): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(`${AUTH_PREFIX}/logout`);
    return response.data;
};
