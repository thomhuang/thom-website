import axios from 'axios';

const BASE_ROUTE = process.env.REACT_APP_API_URL;

export interface ShopImage {
  id: string;
  objectKey: string;
  url: string;
  altText: string;
  sortOrder: number;
}

export interface ShopItemSummary {
  id: string;
  title: string;
  brandId: string;
  brand: string;
  priceCents: number;
  currency: string;
  stock: number;
  isPublished: boolean;
  primaryImageUrl: string;
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  brandId: string;
  brand: string;
  priceCents: number;
  currency: string;
  stock: number;
  isPublished: boolean;
  images: ShopImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopItemRequest {
  title: string;
  description: string;
  brandId: string;
  brand: string;
  priceCents: number;
  currency: string;
  stock: number;
  isPublished: boolean;
}

export interface ShopBrand {
  id: string;
  brand: string;
  createdAt?: string;
}

export type ShopItemPatch = Partial<ShopItemRequest>;

export interface ShopImageUploadTicket {
  objectKey: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
}

export interface ShopImageRequest {
  objectKey: string;
  altText: string;
  sortOrder?: number;
}

export interface ShopOrderLine {
  id: string;
  itemId: string;
  title: string;
  unitPriceCents: number;
  quantity: number;
}

export interface ShopOrder {
  id: string;
  stripeSessionId: string;
  status: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  amountTotalCents: number;
  currency: string;
  lines: ShopOrderLine[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopCheckoutSession {
  sessionId: string;
  url: string;
}

export async function GetShopItemsAsync(
  signal?: AbortSignal
): Promise<ShopItemSummary[]> {
  const response = await axios({
    method: 'GET',
    signal,
    url: `${BASE_ROUTE}/shop/items`,
    withCredentials: true,
  });

  return response.data;
}

export async function GetShopItemByIdAsync(
  id: string,
  signal?: AbortSignal
): Promise<ShopItem> {
  const response = await axios({
    method: 'GET',
    signal,
    url: `${BASE_ROUTE}/shop/items/${id}`,
    withCredentials: true,
  });

  return response.data;
}

export async function CreateShopItemAsync(
  request: ShopItemRequest
): Promise<ShopItem> {
  const response = await axios({
    method: 'POST',
    url: `${BASE_ROUTE}/shop/items`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function UpdateShopItemAsync(
  id: string,
  request: ShopItemPatch
): Promise<ShopItem> {
  const response = await axios({
    method: 'PATCH',
    url: `${BASE_ROUTE}/shop/items/${id}`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function DeleteShopItemAsync(id: string): Promise<void> {
  await axios({
    method: 'DELETE',
    url: `${BASE_ROUTE}/shop/items/${id}`,
    withCredentials: true,
  });
}

export async function GetShopBrandsAsync(
  signal?: AbortSignal
): Promise<ShopBrand[]> {
  const response = await axios({
    method: 'GET',
    signal,
    url: `${BASE_ROUTE}/shop/brands`,
  });

  return response.data;
}

export async function CreateShopBrandAsync(
  request: ShopBrand
): Promise<ShopBrand> {
  const response = await axios({
    method: 'POST',
    url: `${BASE_ROUTE}/shop/brands`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function CreateShopImageUploadAsync(
  itemId: string,
  contentType: string
): Promise<ShopImageUploadTicket> {
  const response = await axios({
    method: 'POST',
    url: `${BASE_ROUTE}/shop/items/${itemId}/images/presign`,
    data: { contentType },
    withCredentials: true,
  });

  return response.data;
}

export async function CreateShopImageAsync(
  itemId: string,
  request: ShopImageRequest
): Promise<ShopImage> {
  const response = await axios({
    method: 'POST',
    url: `${BASE_ROUTE}/shop/items/${itemId}/images`,
    data: request,
    withCredentials: true,
  });

  return response.data;
}

export async function DeleteShopImageAsync(
  itemId: string,
  imageId: string
): Promise<void> {
  await axios({
    method: 'DELETE',
    url: `${BASE_ROUTE}/shop/items/${itemId}/images/${imageId}`,
    withCredentials: true,
  });
}

export async function StartShopCheckoutAsync(
  itemId: string,
  quantity = 1
): Promise<ShopCheckoutSession> {
  const response = await axios({
    method: 'POST',
    url: `${BASE_ROUTE}/shop/checkout`,
    data: { itemId, quantity },
    withCredentials: true,
  });

  return response.data;
}

export async function GetShopOrderAsync(
  sessionId: string,
  signal?: AbortSignal
): Promise<ShopOrder> {
  const response = await axios({
    method: 'GET',
    signal,
    url: `${BASE_ROUTE}/shop/orders/${sessionId}`,
    withCredentials: true,
  });

  return response.data;
}

// The upload goes straight to R2 with a signed URL, so it must bypass axios:
// no API base URL, no auth cookie, and the exact Content-Type that was signed.
export async function UploadShopImageAsync(
  uploadUrl: string,
  file: File,
  contentType: string
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
