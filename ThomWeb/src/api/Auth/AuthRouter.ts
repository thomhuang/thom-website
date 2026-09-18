import { apiRequest } from '../client';

export interface AuthUser {
  authenticated: boolean;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export async function LoginAsync(request: LoginRequest): Promise<AuthUser> {
  return apiRequest<AuthUser>({
    method: 'POST',
    url: '/auth/login',
    data: request,
    withCredentials: true,
  });
}

export async function LogoutAsync(): Promise<void> {
  await apiRequest<void>({
    method: 'POST',
    url: '/auth/logout',
    withCredentials: true,
  });
}

export async function GetCurrentUserAsync(): Promise<AuthUser> {
  return apiRequest<AuthUser>({
    method: 'GET',
    url: '/auth/me',
    withCredentials: true,
  });
}
