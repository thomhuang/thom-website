import { apiRequest } from '../client';

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
  category: string;
  priceCents: number;
  currency: string;
  stock: number;
  isPublished: boolean;
  primaryImageUrl: string;
}

export interface ShopMeasurement {
  id?: string;
  label: string;
  valueInches: number;
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  brandId: string;
  brand: string;
  category: string;
  size: string;
  priceCents: number;
  currency: string;
  stock: number;
  isPublished: boolean;
  measurements: ShopMeasurement[];
  images: ShopImage[];
  createdAt?: string;
  updatedAt?: string;
}

export type ShopItemRequest = Omit<
  ShopItem,
  'id' | 'images' | 'createdAt' | 'updatedAt'
>;

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
  status: ShopOrderStatus;
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  shipName: string;
  shipLine1: string;
  shipLine2: string;
  shipCity: string;
  shipState: string;
  shipPostalCode: string;
  shipCountry: string;
  amountTotalCents: number;
  currency: string;
  lines: ShopOrderLine[];
  refundedAt: string;
  refundReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopOrdersPage {
  orders: ShopOrder[];
  nextCursor: string;
}

export type ShopOrderStatus =
  | 'pending'
  | 'paid'
  | 'refund_pending'
  | 'refunded'
  | 'expired';

// The confirmation endpoint is public, so it returns no personal data. Customer
// and shipping fields are only available from the authenticated admin list.
export interface PublicShopOrder {
  id: string;
  status: ShopOrderStatus;
  amountTotalCents: number;
  currency: string;
  lines: ShopOrderLine[];
  refundedAt: string;
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
  return apiRequest<ShopItemSummary[]>({
    method: 'GET',
    signal,
    url: '/shop/items',
    withCredentials: true,
  });
}

export async function GetShopItemByIdAsync(
  id: string,
  signal?: AbortSignal
): Promise<ShopItem> {
  return apiRequest<ShopItem>({
    method: 'GET',
    signal,
    url: `/shop/items/${id}`,
    withCredentials: true,
  });
}

export async function CreateShopItemAsync(
  request: ShopItemRequest
): Promise<ShopItem> {
  return apiRequest<ShopItem>({
    method: 'POST',
    url: '/shop/items',
    data: request,
    withCredentials: true,
  });
}

export async function UpdateShopItemAsync(
  id: string,
  request: ShopItemPatch
): Promise<ShopItem> {
  return apiRequest<ShopItem>({
    method: 'PATCH',
    url: `/shop/items/${id}`,
    data: request,
    withCredentials: true,
  });
}

export async function DeleteShopItemAsync(id: string): Promise<void> {
  await apiRequest<void>({
    method: 'DELETE',
    url: `/shop/items/${id}`,
    withCredentials: true,
  });
}

export interface ShopItemsPublicationResult {
  updated: number;
}

// Publishes or unpublishes several listings in one request. The server ignores
// ids that no longer exist, so a stale selection does not fail the batch.
export async function UpdateShopItemsPublicationAsync(
  ids: string[],
  isPublished: boolean
): Promise<ShopItemsPublicationResult> {
  return apiRequest<ShopItemsPublicationResult>({
    method: 'PATCH',
    url: '/shop/items',
    data: { ids: ids.map(Number), isPublished },
    withCredentials: true,
  });
}

export async function GetShopBrandsAsync(
  signal?: AbortSignal
): Promise<ShopBrand[]> {
  return apiRequest<ShopBrand[]>({
    method: 'GET',
    signal,
    url: '/shop/brands',
  });
}

export async function CreateShopImageUploadAsync(
  itemId: string,
  contentType: string
): Promise<ShopImageUploadTicket> {
  return apiRequest<ShopImageUploadTicket>({
    method: 'POST',
    url: `/shop/items/${itemId}/images/presign`,
    data: { contentType },
    withCredentials: true,
  });
}

export async function CreateShopImageAsync(
  itemId: string,
  request: ShopImageRequest
): Promise<ShopImage> {
  return apiRequest<ShopImage>({
    method: 'POST',
    url: `/shop/items/${itemId}/images`,
    data: request,
    withCredentials: true,
  });
}

export async function DeleteShopImageAsync(
  itemId: string,
  imageId: string
): Promise<void> {
  await apiRequest<void>({
    method: 'DELETE',
    url: `/shop/items/${itemId}/images/${imageId}`,
    withCredentials: true,
  });
}

export interface ShopCheckoutLineRequest {
  itemId: string;
  quantity: number;
}

export async function StartShopCheckoutAsync(
  lines: ShopCheckoutLineRequest[]
): Promise<ShopCheckoutSession> {
  return apiRequest<ShopCheckoutSession>({
    method: 'POST',
    url: '/shop/checkout',
    data: { items: lines },
    withCredentials: true,
  });
}

export async function GetShopOrderAsync(
  sessionId: string,
  signal?: AbortSignal
): Promise<PublicShopOrder> {
  return apiRequest<PublicShopOrder>({
    method: 'GET',
    signal,
    url: `/shop/orders/${sessionId}`,
    withCredentials: true,
  });
}

// The emailed token is the credential for a buyer's own order, so unlike the
// session-keyed confirmation endpoint this returns the full order including the
// customer and shipping fields.
export async function GetShopOrderByTokenAsync(
  token: string,
  signal?: AbortSignal
): Promise<ShopOrder> {
  return apiRequest<ShopOrder>({
    method: 'GET',
    signal,
    url: `/shop/orders/view/${encodeURIComponent(token)}`,
  });
}

// Orders are keyset-paginated: pass the previous page's nextCursor to fetch the
// page after it, and stop when the returned nextCursor is empty.
export async function GetShopOrdersAsync(options: {
  cursor?: string;
  limit?: number;
  signal?: AbortSignal;
} = {}): Promise<ShopOrdersPage> {
  const params = new URLSearchParams();
  if (options.cursor) {
    params.set('cursor', options.cursor);
  }
  if (options.limit !== undefined) {
    params.set('limit', String(options.limit));
  }
  const query = params.toString();

  return apiRequest<ShopOrdersPage>({
    method: 'GET',
    signal: options.signal,
    url: query ? `/shop/orders?${query}` : '/shop/orders',
    withCredentials: true,
  });
}

// The upload goes straight to R2 with a signed URL, so it must bypass axios:
// no API base URL, no auth cookie, and the exact Content-Type that was signed.
export async function UploadShopImageAsync(
  uploadUrl: string,
  blob: Blob,
  contentType: string
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}
