import axios from 'axios';

import { API_BASE_URL } from '../config';

export interface AuthUser {
  authenticated: boolean;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export async function LoginAsync(request: LoginRequest): Promise<AuthUser> {
  const response = await axios({
    method: 'POST',
    url: `${API_BASE_URL}/auth/login`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function LogoutAsync(): Promise<void> {
  await axios({
    method: 'POST',
    url: `${API_BASE_URL}/auth/logout`,
    withCredentials: true,
  });
}

export async function GetCurrentUserAsync(): Promise<AuthUser> {
  const response = await axios({
    method: 'GET',
    url: `${API_BASE_URL}/auth/me`,
    withCredentials: true,
  });

  return response.data;
}
