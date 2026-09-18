import axios, { AxiosRequestConfig } from 'axios';

import { API_BASE_URL } from './config';

// Single entry point for API calls. Applying the base URL here keeps every
// router consistent, and the generic keeps response typing at the network
// boundary instead of falling back to axios' implicit any. withCredentials
// stays per-call because public reads (coffee entries, shop brands) do not send
// the auth cookie.
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await axios<T>({ baseURL: API_BASE_URL, ...config });

  return response.data;
}
