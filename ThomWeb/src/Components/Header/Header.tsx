import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useAuth } from '../../Auth/AuthContext';
import { useTheme } from '../../hooks';
import styles from './Headers.module.css';

export default function Header() {
    const [theme, toggleTheme] = useTheme();
    const [authUsername, setAuthUsername] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const {
        authUser,
        authError,
        clearAuthError,
        isAuthLoading,
        isAuthSubmitting,
        login,
        logout,
    } = useAuth();

    async function submitLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const didSignIn = await login({
            username: authUsername,
            password: authPassword,
        });

        if (didSignIn) {
            setAuthPassword('');
        }
    }

    function updateAuthUsername(username: string) {
        clearAuthError();
        setAuthUsername(username);
    }

    function updateAuthPassword(password: string) {
        clearAuthError();
        setAuthPassword(password);
    }

    function authControl() {
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
            <details className={styles.authMenu}>
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

    return (
        <header className={styles.header}>
            <Link to={PAGES.Home} className={styles.name}>
                Thomas Huang
            </Link>
            <nav className={styles.nav}>
                <Link to={PAGES.Home} className={styles.navLink}>
                    home
                </Link>
                <Link to={PAGES.Coffee} className={styles.navLink}>
                    coffee
                </Link>
                {authControl()}
                <button
                    type="button"
                    className={styles.textButton}
                    onClick={toggleTheme}
                >
                    {theme === 'dark' ? 'light' : 'dark'}
                </button>
            </nav>
        </header>
    );
}
