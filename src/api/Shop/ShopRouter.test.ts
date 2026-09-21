import { beforeEach, describe, expect, test, vi } from 'vitest';

import { apiRequest } from '../client';
import {
  GetShopOrderByTokenAsync,
  GetShopOrdersAsync,
  UpdateShopItemsPublicationAsync,
  UploadShopImageAsync,
} from './ShopRouter';

vi.mock('../client', () => ({
  apiRequest: vi.fn(),
}));

const mockedApiRequest = vi.mocked(apiRequest);

beforeEach(() => {
  mockedApiRequest.mockReset();
});

describe('GetShopOrdersAsync', () => {
  test('requests the first page without query params', async () => {
    mockedApiRequest.mockResolvedValue({ orders: [], nextCursor: '' });

    await GetShopOrdersAsync();

    expect(mockedApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', url: '/shop/orders' })
    );
  });

  test('passes cursor and limit as query params', async () => {
    mockedApiRequest.mockResolvedValue({ orders: [], nextCursor: '' });

    await GetShopOrdersAsync({ cursor: 'abc', limit: 5 });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/shop/orders?cursor=abc&limit=5',
      })
    );
  });
});

describe('GetShopOrderByTokenAsync', () => {
  test('URL-encodes the token in the path', async () => {
    mockedApiRequest.mockResolvedValue({});

    await GetShopOrderByTokenAsync('a/b?c');

    expect(mockedApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/shop/orders/view/a%2Fb%3Fc',
      })
    );
  });
});

describe('UpdateShopItemsPublicationAsync', () => {
  test('sends numeric ids and the published flag in one PATCH', async () => {
    mockedApiRequest.mockResolvedValue({ updated: 2 });

    await UpdateShopItemsPublicationAsync(['1', '2'], false);

    expect(mockedApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        url: '/shop/items',
        data: { ids: [1, 2], isPublished: false },
        withCredentials: true,
      })
    );
  });
});

describe('UploadShopImageAsync', () => {
  test('PUTs the blob to the signed URL with the signed content type', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await UploadShopImageAsync(
      'https://storage.example.com/key',
      new Blob(['x']),
      'image/webp'
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://storage.example.com/key',
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'image/webp' },
        referrerPolicy: 'no-referrer',
      })
    );

    vi.unstubAllGlobals();
  });

  test('throws on a failed upload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 403 })
    );

    await expect(
      UploadShopImageAsync(
        'https://storage.example.com/key',
        new Blob(['x']),
        'image/webp'
      )
    ).rejects.toThrow('Upload failed with status 403');

    vi.unstubAllGlobals();
  });
});
