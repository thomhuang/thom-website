import { apiRequest } from '../client';

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

// The optional numeric fields are blank-able in the form, so they are optional
// here and omitted from the request rather than sent as zero.
export type CoffeeEntryRequest = Omit<
  CoffeeEntry,
  | 'id'
  | 'createdAt'
  | 'tastingNotes'
  | 'daysSinceRoast'
  | 'grindSetting'
  | 'dose'
  | 'yieldAmount'
  | 'waterTemperature'
  | 'bloomWater'
> & {
  daysSinceRoast?: number;
  grindSetting?: number;
  dose?: number;
  yieldAmount?: number;
  waterTemperature?: number;
  bloomWater?: number;
};

export type CoffeeEntryPatch = Partial<CoffeeEntryRequest>;

export async function GetCoffeeEntriesAsync(
  signal?: AbortSignal
): Promise<CoffeeEntrySummary[]> {
  return apiRequest<CoffeeEntrySummary[]>({
    method: 'GET',
    signal,
    url: '/coffee',
  });
}

export async function GetCoffeeRoastersAsync(
  signal?: AbortSignal
): Promise<CoffeeRoaster[]> {
  return apiRequest<CoffeeRoaster[]>({
    method: 'GET',
    signal,
    url: '/coffee/roasters',
  });
}

export async function CreateCoffeeRoasterAsync(
  request: CoffeeRoaster
): Promise<CoffeeRoaster> {
  return apiRequest<CoffeeRoaster>({
    method: 'POST',
    url: '/coffee/roasters',
    data: request,
    withCredentials: true,
  });
}

export async function GetCoffeeGrindersAsync(
  signal?: AbortSignal
): Promise<CoffeeGrinder[]> {
  return apiRequest<CoffeeGrinder[]>({
    method: 'GET',
    signal,
    url: '/coffee/grinders',
  });
}

export async function CreateCoffeeGrinderAsync(
  request: CoffeeGrinder
): Promise<CoffeeGrinder> {
  return apiRequest<CoffeeGrinder>({
    method: 'POST',
    url: '/coffee/grinders',
    data: request,
    withCredentials: true,
  });
}

export async function GetCoffeeEntryByIdAsync(
  id: string,
  signal?: AbortSignal
): Promise<CoffeeEntry> {
  return apiRequest<CoffeeEntry>({
    method: 'GET',
    signal,
    url: `/coffee/${id}`,
  });
}

export async function CreateCoffeeEntryAsync(
  request: CoffeeEntryRequest
): Promise<CoffeeEntry> {
  return apiRequest<CoffeeEntry>({
    method: 'POST',
    url: '/coffee',
    data: request,
    withCredentials: true,
  });
}

export async function UpdateCoffeeEntryAsync(
  id: string,
  request: CoffeeEntryPatch
): Promise<CoffeeEntry> {
  return apiRequest<CoffeeEntry>({
    method: 'PATCH',
    url: `/coffee/${id}`,
    data: request,
    withCredentials: true,
  });
}

export async function DeleteCoffeeEntryAsync(id: string): Promise<void> {
  await apiRequest<void>({
    method: 'DELETE',
    url: `/coffee/${id}`,
    withCredentials: true,
  });
}
