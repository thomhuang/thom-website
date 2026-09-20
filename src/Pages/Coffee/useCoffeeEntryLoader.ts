import { useEffect, useState } from 'react';

import { GetCoffeeEntryByIdAsync } from '../../api/Coffee/CoffeeRouter';
import {
  createDraftFromEntry,
  createDraftFromPrefill,
  createEmptyDraft,
  createLookupOption,
} from './coffeeEntryDraft';
import type {
  BrewLogDraft,
  CoffeePrefill,
  LookupOption,
} from './coffeeEntryDraft';

type LookupControls = {
  mergeOptions: (options: LookupOption[]) => void;
  setSearch: (value: string) => void;
};

type UseCoffeeEntryLoaderArgs = {
  entryId?: string;
  isEditing: boolean;
  isAdmin: boolean;
  isAuthLoading: boolean;
  prefill?: CoffeePrefill;
  roaster: LookupControls;
  grinder: LookupControls;
  setDraft: (draft: BrewLogDraft) => void;
  setFormError: (message: string) => void;
};

// Seeds the form from a prefill, or loads an existing entry, keeping the
// roaster and grinder pickers in sync with the draft.
export function useCoffeeEntryLoader({
  entryId,
  isEditing,
  isAdmin,
  isAuthLoading,
  prefill,
  roaster,
  grinder,
  setDraft,
  setFormError,
}: UseCoffeeEntryLoaderArgs) {
  const [entryLoadFailed, setEntryLoadFailed] = useState(false);
  const [isEntryLoading, setIsEntryLoading] = useState(isEditing);

  const {
    mergeOptions: mergeRoasterOptions,
    setSearch: setRoasterSearch,
  } = roaster;
  const {
    mergeOptions: mergeGrinderOptions,
    setSearch: setGrinderSearch,
  } = grinder;

  useEffect(() => {
    if (!isEditing || !entryId) {
      if (prefill) {
        let roasterId = '';

        if (prefill.roaster.trim()) {
          const roasterOption = createLookupOption(
            prefill.roaster,
            prefill.roasterId
          );

          roasterId = roasterOption.id;
          mergeRoasterOptions([roasterOption]);
          setRoasterSearch(roasterOption.label);
        } else {
          setRoasterSearch('');
        }

        setDraft(createDraftFromPrefill(prefill, roasterId));
      } else {
        setDraft(createEmptyDraft());
        setRoasterSearch('');
      }

      setGrinderSearch('');
      setFormError('');
      setEntryLoadFailed(false);
      setIsEntryLoading(false);
      return;
    }

    if (isAuthLoading) {
      return;
    }

    if (!isAdmin) {
      setIsEntryLoading(false);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const loadEntry = async () => {
      setIsEntryLoading(true);
      setFormError('');
      setEntryLoadFailed(false);

      try {
        const entry = await GetCoffeeEntryByIdAsync(entryId, controller.signal);
        const roasterOption = createLookupOption(
          entry.roaster,
          entry.roasterId
        );
        const grinderOption = createLookupOption(
          entry.grinder,
          entry.grinderId
        );

        if (isMounted) {
          mergeRoasterOptions([roasterOption]);
          mergeGrinderOptions([grinderOption]);
          setDraft(
            createDraftFromEntry(entry, roasterOption.id, grinderOption.id)
          );
          setRoasterSearch(roasterOption.label);
          setGrinderSearch(grinderOption.label);
        }
      } catch {
        if (!controller.signal.aborted && isMounted) {
          setEntryLoadFailed(true);
          setFormError('Coffee entry could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setIsEntryLoading(false);
        }
      }
    };

    loadEntry();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [
    entryId,
    isAdmin,
    isAuthLoading,
    isEditing,
    prefill,
    mergeRoasterOptions,
    setRoasterSearch,
    mergeGrinderOptions,
    setGrinderSearch,
    setDraft,
    setFormError,
  ]);

  return { isEntryLoading, entryLoadFailed };
}
