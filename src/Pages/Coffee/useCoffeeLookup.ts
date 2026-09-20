import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  CreateCoffeeGrinderAsync,
  CreateCoffeeRoasterAsync,
  GetCoffeeGrindersAsync,
  GetCoffeeRoastersAsync,
} from '../../api/Coffee/CoffeeRouter';
import {
  createLookupOption,
  filterOptionsBySearch,
  mergeById,
} from './coffeeEntryDraft';
import type { LookupOption } from './coffeeEntryDraft';

export type CoffeeLookup = {
  options: LookupOption[];
  filteredOptions: LookupOption[];
  selectedOption?: LookupOption;
  search: string;
  newValue: string;
  isLoading: boolean;
  isSubmitting: boolean;
  setSearch: (value: string) => void;
  setNewValue: (value: string) => void;
  mergeOptions: (options: LookupOption[]) => void;
  changeSearch: (value: string) => void;
  select: (option: LookupOption) => void;
  add: () => Promise<void>;
};

type UseCoffeeLookupArgs = {
  loadOptions: (signal: AbortSignal) => Promise<LookupOption[]>;
  saveOption: (option: LookupOption) => Promise<LookupOption>;
  enabled: boolean;
  selectedId: string;
  loadErrorMessage: string;
  saveErrorMessage: string;
  onSelect: (id: string) => void;
  onError: (message: string) => void;
};

// A searchable roaster/grinder list: fetch, filter, and add-by-name all share
// the same shape, so the entry form builds two of these.
export function useCoffeeLookup({
  loadOptions,
  saveOption,
  enabled,
  selectedId,
  loadErrorMessage,
  saveErrorMessage,
  onSelect,
  onError,
}: UseCoffeeLookupArgs): CoffeeLookup {
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [search, setSearch] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      try {
        const loaded = await loadOptions(controller.signal);

        if (isMounted) {
          setOptions((current) => mergeById(loaded, current));
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          onError(loadErrorMessage);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [enabled, loadOptions, loadErrorMessage, onError]);

  const selectedOption = options.find((option) => option.id === selectedId);
  const filteredOptions = useMemo(
    () => filterOptionsBySearch(options, search),
    [options, search]
  );

  const mergeOptions = useCallback((nextOptions: LookupOption[]) => {
    setOptions((current) => mergeById(current, nextOptions));
  }, []);

  const select = (option: LookupOption) => {
    onSelect(option.id);
    setSearch(option.label);
  };

  const changeSearch = (value: string) => {
    setSearch(value);

    if (selectedOption && value !== selectedOption.label) {
      onSelect('');
    }
  };

  const add = async () => {
    const name = newValue.trim();

    if (!name) {
      return;
    }

    const existing = options.find(
      (option) => option.label.toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      select(existing);
      setNewValue('');
      return;
    }

    onError('');
    setIsSubmitting(true);

    try {
      const saved = await saveOption(createLookupOption(name));

      setOptions((current) => mergeById(current, [saved]));
      select(saved);
      setNewValue('');
    } catch {
      onError(saveErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    options,
    filteredOptions,
    selectedOption,
    search,
    newValue,
    isLoading,
    isSubmitting,
    setSearch,
    setNewValue,
    mergeOptions,
    changeSearch,
    select,
    add,
  };
}

export const loadRoasterOptions = async (
  signal: AbortSignal
): Promise<LookupOption[]> => {
  const roasters = await GetCoffeeRoastersAsync(signal);

  return roasters.map((roaster) => ({ id: roaster.id, label: roaster.roaster }));
};

export const saveRoasterOption = async (
  option: LookupOption
): Promise<LookupOption> => {
  const saved = await CreateCoffeeRoasterAsync({
    id: option.id,
    roaster: option.label,
  });

  return { id: saved.id, label: saved.roaster };
};

export const loadGrinderOptions = async (
  signal: AbortSignal
): Promise<LookupOption[]> => {
  const grinders = await GetCoffeeGrindersAsync(signal);

  return grinders.map((grinder) => ({ id: grinder.id, label: grinder.grinder }));
};

export const saveGrinderOption = async (
  option: LookupOption
): Promise<LookupOption> => {
  const saved = await CreateCoffeeGrinderAsync({
    id: option.id,
    grinder: option.label,
  });

  return { id: saved.id, label: saved.grinder };
};
