import { FormEvent, useEffect, useRef, useState } from 'react';

import { useAuth } from '../../Auth/AuthContext';
import styles from './Headers.module.css';

// The login form and signed-in status are self-contained: they own their input
// state and only need the auth context, so they live outside Header.
export default function AuthControl() {
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const authMenuRef = useRef<HTMLDetailsElement>(null);
  const {
    authUser,
    authError,
    clearAuthError,
    isAuthLoading,
    isAuthSubmitting,
    login,
    logout,
  } = useAuth();

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      const menu = authMenuRef.current;
      if (!menu?.open) return;
      if (!(event.target instanceof Node) || !menu.contains(event.target)) {
        menu.open = false;
      }
    }

    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, []);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await login({
      username: authUsername,
      password: authPassword,
    });

    // Clear the password either way so it does not linger in component
    // state after a failed attempt.
    setAuthPassword('');
  }

  function updateAuthUsername(username: string) {
    clearAuthError();
    setAuthUsername(username);
  }

  function updateAuthPassword(password: string) {
    clearAuthError();
    setAuthPassword(password);
  }

  if (authUser) {
    return (
      <span className={styles.authStatus}>
        <span className={styles.authUser}>{authUser.username}</span>
        <button
          type="button"
          className={styles.textButton}
          onClick={logout}
          disabled={isAuthSubmitting}
        >
          sign out
        </button>
        {authError && <p className={styles.authError}>{authError}</p>}
      </span>
    );
  }

  return (
    <details ref={authMenuRef} className={styles.authMenu}>
      <summary className={styles.textButton}>login</summary>
      <form className={styles.authForm} onSubmit={submitLogin}>
        <label className={styles.authField} htmlFor="header-auth-username">
          Username
          <input
            id="header-auth-username"
            type="text"
            value={authUsername}
            onChange={(event) => updateAuthUsername(event.target.value)}
            autoComplete="username"
          />
        </label>
        <label className={styles.authField} htmlFor="header-auth-password">
          Password
          <input
            id="header-auth-password"
            type="password"
            value={authPassword}
            onChange={(event) => updateAuthPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className={styles.textButton}
          disabled={
            isAuthLoading ||
            isAuthSubmitting ||
            !authUsername.trim() ||
            !authPassword
          }
        >
          {isAuthSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
        {authError && <p className={styles.authError}>{authError}</p>}
      </form>
    </details>
  );
}
