import {
  DependencyList,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

type UseAsyncOptions<T> = {
  initialData: T;
  enabled?: boolean;
  errorMessage?: string;
};

type UseAsyncResult<T> = {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
  isLoading: boolean;
  error: string;
};

// Loads once on mount and again whenever `deps` change, aborting the in-flight
// request on cleanup. This is the loading/error/data shape every page used to
// spell out with its own AbortController + isMounted effect.
//
// `deps` must be primitives or otherwise stable: the loader is not part of the
// dependency list, so a fresh array/object dep would refetch every render.
export function useAsync<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  { initialData, enabled = true, errorMessage = '' }: UseAsyncOptions<T>
): UseAsyncResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const run = async () => {
      setIsLoading(true);
      setError('');

      try {
        const loaded = await load(controller.signal);

        if (isMounted) {
          setData(loaded);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setError(errorMessage);
          setData(initialData);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
      controller.abort();
    };
    // Callers own the dependency list; `load` is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  // While disabled the caller renders its own "not available" state, and a
  // consumer that flips enabled (auth resolving) stays in loading rather than
  // flashing its empty state for a frame.
  return { data, setData, isLoading: enabled && isLoading, error };
}
