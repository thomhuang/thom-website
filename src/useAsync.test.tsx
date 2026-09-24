import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { useAsync } from './useAsync';

describe('useAsync', () => {
  test('loads data and clears the loading flag', async () => {
    const load = vi.fn().mockResolvedValue('value');
    const { result } = renderHook(() => useAsync(load, [], { initialData: '' }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBe('value');
    expect(result.current.error).toBe('');
  });

  test('reports an error and resets to the initial data', async () => {
    const load = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() =>
      useAsync(load, [], { initialData: 'none', errorMessage: 'Failed.' })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Failed.');
    expect(result.current.data).toBe('none');
  });

  test('does not fetch while disabled', () => {
    const load = vi.fn();
    const { result } = renderHook(() =>
      useAsync(load, [], { initialData: '', enabled: false })
    );

    expect(load).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  test('is loading as soon as it becomes enabled', () => {
    const load = vi.fn(() => new Promise<string>(() => {}));
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useAsync(load, [], { initialData: '', enabled }),
      { initialProps: { enabled: false } }
    );

    expect(result.current.isLoading).toBe(false);

    rerender({ enabled: true });

    expect(result.current.isLoading).toBe(true);
  });

  test('refetches when a dependency changes', async () => {
    const load = vi.fn().mockResolvedValue('a');
    const { result, rerender } = renderHook(
      ({ id }: { id: number }) =>
        useAsync(() => load(id), [id], { initialData: '' }),
      { initialProps: { id: 1 } }
    );

    await waitFor(() => expect(result.current.data).toBe('a'));
    expect(load).toHaveBeenCalledTimes(1);

    rerender({ id: 2 });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
  });

  test('aborts the in-flight request on unmount', () => {
    let captured: AbortSignal | undefined;
    const load = vi.fn((signal: AbortSignal) => {
      captured = signal;
      return new Promise<string>(() => {});
    });
    const { unmount } = renderHook(() =>
      useAsync(load, [], { initialData: '' })
    );

    expect(captured?.aborted).toBe(false);

    unmount();

    expect(captured?.aborted).toBe(true);
  });
});
