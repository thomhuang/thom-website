import axios from 'axios';

import { API_BASE_URL } from '../config';

export interface CoffeeEntrySummary {
  id: string;
  date: string;
  coffeeName: string;
  origin: string;
  coffeeVarietal: string;
  processingMethod: string;
  daysSinceRoast?: number;
  roasterId?: string;
  roaster: string;
  brewMethod: string;
  ratio: string;
  grinderId?: string;
  grinder?: string;
  grindSetting?: number;
  dose?: number;
  yieldAmount?: number;
  waterTemperature?: number;
  brewTime?: string;
  bloomTime?: string;
  bloomWater?: number;
  pourNotes?: string;
  roastLevel?: string;
  notes?: string;
  tastingNotes: string;
  rating: number;
}

export interface CoffeeEntry extends CoffeeEntrySummary {
  daysSinceRoast: number;
  roasterId: string;
  grinderId: string;
  grinder: string;
  grindSetting: number;
  dose: number;
  yieldAmount: number;
  waterTemperature: number;
  brewTime: string;
  bloomTime: string;
  bloomWater: number;
  pourNotes: string;
  roastLevel: string;
  notes: string;
  createdAt?: string;
}

export interface CoffeeRoaster {
  id: string;
  roaster: string;
  createdAt?: string;
}

export interface CoffeeGrinder {
  id: string;
  grinder: string;
  createdAt?: string;
}

export type CoffeeEntryRequest = Omit<
  CoffeeEntry,
  'id' | 'createdAt' | 'tastingNotes'
>;

export type CoffeeEntryPatch = Partial<CoffeeEntryRequest>;

export async function GetCoffeeEntriesAsync(
  signal?: AbortSignal
): Promise<CoffeeEntrySummary[]> {
  const response = await axios({
    method: 'GET',
    signal,
    url: `${API_BASE_URL}/coffee`,
  });

  return response.data;
}

export async function GetCoffeeRoastersAsync(
  signal?: AbortSignal
): Promise<CoffeeRoaster[]> {
  const response = await axios({
    method: 'GET',
    signal,
    url: `${API_BASE_URL}/coffee/roasters`,
  });

  return response.data;
}

export async function CreateCoffeeRoasterAsync(
  request: CoffeeRoaster
): Promise<CoffeeRoaster> {
  const response = await axios({
    method: 'POST',
    url: `${API_BASE_URL}/coffee/roasters`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function GetCoffeeGrindersAsync(
  signal?: AbortSignal
): Promise<CoffeeGrinder[]> {
  const response = await axios({
    method: 'GET',
    signal,
    url: `${API_BASE_URL}/coffee/grinders`,
  });

  return response.data;
}

export async function CreateCoffeeGrinderAsync(
  request: CoffeeGrinder
): Promise<CoffeeGrinder> {
  const response = await axios({
    method: 'POST',
    url: `${API_BASE_URL}/coffee/grinders`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function GetCoffeeEntryByIdAsync(
  id: string,
  signal?: AbortSignal
): Promise<CoffeeEntry> {
  const response = await axios({
    method: 'GET',
    signal,
    url: `${API_BASE_URL}/coffee/${id}`,
  });

  return response.data;
}

export async function CreateCoffeeEntryAsync(
  request: CoffeeEntryRequest
): Promise<CoffeeEntry> {
  const response = await axios({
    method: 'POST',
    url: `${API_BASE_URL}/coffee`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function UpdateCoffeeEntryAsync(
  id: string,
  request: CoffeeEntryPatch
): Promise<CoffeeEntry> {
  const response = await axios({
    method: 'PATCH',
    url: `${API_BASE_URL}/coffee/${id}`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function DeleteCoffeeEntryAsync(id: string): Promise<void> {
  await axios({
    method: 'DELETE',
    url: `${API_BASE_URL}/coffee/${id}`,
    withCredentials: true,
  });
}
