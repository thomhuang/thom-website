import axios from 'axios';

const BASE_ROUTE = process.env.REACT_APP_API_URL;

export interface CoffeeEntrySummary {
  id: string;
  date: string;
  coffeeName: string;
  origin: string;
  coffeeVarietal: string;
  processingMethod: string;
  roaster: string;
  brewMethod: string;
  ratio: string;
  tastingNotes: string;
  rating: number;
}

export interface CoffeeEntry extends CoffeeEntrySummary {
  daysSinceRoast: string;
  roasterId: string;
  grinder: string;
  grindSetting: string;
  dose: string;
  yieldAmount: string;
  waterTemperature: string;
  brewTime: string;
  bloomTime: string;
  bloomWater: string;
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
    url: `${BASE_ROUTE}/coffee`,
  });

  return response.data;
}

export async function GetCoffeeRoastersAsync(
  signal?: AbortSignal
): Promise<CoffeeRoaster[]> {
  const response = await axios({
    method: 'GET',
    signal,
    url: `${BASE_ROUTE}/coffee/roasters`,
  });

  return response.data;
}

export async function CreateCoffeeRoasterAsync(
  request: CoffeeRoaster
): Promise<CoffeeRoaster> {
  const response = await axios({
    method: 'POST',
    url: `${BASE_ROUTE}/coffee/roasters`,
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
    url: `${BASE_ROUTE}/coffee/${id}`,
  });

  return response.data;
}

export async function CreateCoffeeEntryAsync(
  request: CoffeeEntryRequest
): Promise<CoffeeEntry> {
  const response = await axios({
    method: 'POST',
    url: `${BASE_ROUTE}/coffee`,
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
    url: `${BASE_ROUTE}/coffee/${id}`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function DeleteCoffeeEntryAsync(id: string): Promise<void> {
  await axios({
    method: 'DELETE',
    url: `${BASE_ROUTE}/coffee/${id}`,
    withCredentials: true,
  });
}
