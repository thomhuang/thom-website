import axios from 'axios';

const BASE_ROUTE = process.env.REACT_APP_API_URL;

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
    url: `${BASE_ROUTE}/auth/login`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function LogoutAsync(): Promise<void> {
  await axios({
    method: 'POST',
    url: `${BASE_ROUTE}/auth/logout`,
    withCredentials: true,
  });
}

export async function GetCurrentUserAsync(): Promise<AuthUser> {
  const response = await axios({
    method: 'GET',
    url: `${BASE_ROUTE}/auth/me`,
    withCredentials: true,
  });

  return response.data;
}
