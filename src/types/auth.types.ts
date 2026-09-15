// Credentials for POST Methods
export interface SignupCredentials {
    email: string;
    username: string;
    password: string;
}

export interface ResetCredentials {
    email: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface ResetPassCredentials {
    token: string;
    new_password: string;
    confirm_password: string;
}

// Expected Response
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
    is_verified: boolean;
}

export interface MessageResponse {
    message: string;
}

export interface SignupResponse {
    title: string;
    message: string;
    email: string;
}
