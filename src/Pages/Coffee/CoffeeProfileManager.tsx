import { FormEvent, useState } from 'react';

import {
  CreateCoffeeProfileAsync,
  DeleteCoffeeProfileAsync,
  GetCoffeeProfilesAsync,
  UpdateCoffeeProfileAsync,
} from '../../api/Coffee/CoffeeRouter';
import type { CoffeeProfile } from '../../api/Coffee/CoffeeRouter';
import { useAsync } from '../../useAsync';
import Dropdown from '../../Components/Dropdown/Dropdown';
import { brewMethods } from './coffeeEntryDraft';
import { formatBrewMethod } from './coffeeGroups';
import styles from './Coffee.module.css';

export default function CoffeeProfileManager() {
  const { data: profiles, setData: setProfiles, isLoading } = useAsync(
    (signal) => GetCoffeeProfilesAsync(signal),
    [],
    {
      initialData: [] as CoffeeProfile[],
      errorMessage: 'Profiles could not be loaded.',
    }
  );

  const [name, setName] = useState('');
  const [brewMethod, setBrewMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setBrewMethod('');
    setNotes('');
  };

  const startEdit = (profile: CoffeeProfile) => {
    setEditingId(profile.id);
    setName(profile.name);
    setBrewMethod(profile.brewMethod);
    setNotes(profile.notes);
    setActionError('');
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || !brewMethod || !notes.trim()) {
      setActionError('Name, brew method, and notes are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await UpdateCoffeeProfileAsync(editingId, {
          id: editingId,
          name: trimmedName,
          brewMethod,
          notes,
        });
        setProfiles((current) =>
          current.map((profile) => (profile.id === editingId ? updated : profile))
        );
      } else {
        const created = await CreateCoffeeProfileAsync({
          id: '',
          name: trimmedName,
          brewMethod,
          notes,
        });
        setProfiles((current) => [...current, created]);
      }
      resetForm();
    } catch {
      setActionError(
        editingId ? 'Profile could not be updated.' : 'Profile could not be saved.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProfile = async (profile: CoffeeProfile) => {
    if (!window.confirm(`Delete the "${profile.name}" profile?`)) {
      return;
    }

    try {
      await DeleteCoffeeProfileAsync(profile.id);
      setProfiles((current) => current.filter((item) => item.id !== profile.id));
    } catch {
      setActionError('Profile could not be deleted.');
    }
  };

  return (
    <details className={styles.profileManager}>
      <summary className={styles.profileManagerSummary}>
        <h2 className={styles.profileManagerTitle}>Brew profiles</h2>
      </summary>

      {isLoading ? (
        <p className={styles.statusText}>Loading profiles...</p>
      ) : (
        <>
          {actionError && (
            <aside className={styles.errorNotice}>{actionError}</aside>
          )}

          {profiles.length === 0 ? (
            <p className={styles.statusText}>No profiles yet.</p>
          ) : (
            <ul className={styles.profileList}>
              {profiles.map((profile) => (
                <li className={styles.profileItem} key={profile.id}>
                  <span className={styles.profileName}>{profile.name}</span>
                  <span className={styles.profileMethod}>
                    {formatBrewMethod(profile.brewMethod)}
                  </span>
                  <span className={styles.profileNotes}>{profile.notes}</span>
                  <div className={styles.entryActions}>
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => startEdit(profile)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => deleteProfile(profile)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form className={styles.profileForm} onSubmit={saveProfile}>
            <div className={styles.fieldGrid}>
              <label className={styles.field} htmlFor="profile-name">
                Name
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <Dropdown
                label="Brew method"
                value={brewMethod}
                options={[{ value: '', label: 'Select' }, ...brewMethods]}
                onChange={setBrewMethod}
                buttonAriaLabel="Profile brew method"
              />
            </div>
            <label className={styles.field} htmlFor="profile-notes">
              Pour notes
              <textarea
                id="profile-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
              />
            </label>
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSaving}
              >
                {isSaving
                  ? 'Saving'
                  : editingId
                    ? 'Save changes'
                    : 'Add profile'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </details>
  );
}
