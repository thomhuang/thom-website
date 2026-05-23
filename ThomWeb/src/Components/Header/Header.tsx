import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import phrases from '../../Assets/en.json';
import { useAuth } from '../../Auth/AuthContext';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toggleTheme } from '../../Reducers/ThemeSlice';
import { ReactComponent as Moon } from './Assets/moon.svg';
import HandsDown from './Assets/stick_figure_down.png';
import HandsUp from './Assets/stick_figure_up.png';
import { ReactComponent as Sun } from './Assets/sun.svg';
import styles from './Headers.module.css';

export default function Header() {
    const dispatch = useAppDispatch();
    const darkMode = useAppSelector((state) => state.theme.darkMode);
    const nav = useNavigate();
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
    const iconThemeClass = darkMode ? styles.lightIcon : '';
    const navClass = [
        styles.header,
        darkMode ? styles.darkNav : styles.lightNav,
    ].join(' ');
    const figureClass = [styles.figure, iconThemeClass].join(' ');

    function goTo(page: PAGES) {
        nav(page);
    }

    function setTheme() {
        dispatch(toggleTheme());
    }

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

    function themeIcon() {
        return (
            <button
                type="button"
                className={styles.themeButton}
                onClick={setTheme}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                <Moon
                    className={[
                        styles.icon,
                        styles.themeIcon,
                        iconThemeClass,
                        darkMode ? '' : styles.themeIconVisible,
                    ].join(' ')}
                    aria-hidden="true"
                />
                <Sun
                    className={[
                        styles.icon,
                        styles.themeIcon,
                        iconThemeClass,
                        darkMode ? styles.themeIconVisible : '',
                    ].join(' ')}
                    aria-hidden="true"
                />
            </button>
        );
    }

    function authControl() {
        if (authUser) {
            return (
                <div className={styles.authStatus}>
                    <span className={styles.authUser}>{authUser.username}</span>
                    <button
                        type="button"
                        className={styles.authButton}
                        onClick={logout}
                        disabled={isAuthSubmitting}
                    >
                        Sign out
                    </button>
                    {authError && <p className={styles.authError}>{authError}</p>}
                </div>
            );
        }

        return (
            <details className={styles.authMenu}>
                <summary className={styles.authSummary}>Login</summary>
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
                        className={styles.authButton}
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


    function brandIcon() {
        let figure = darkMode
            ? HandsUp
            : HandsDown;

        return (
            <img
                className={figureClass}
                src={figure}
                alt='figure man'
                onClick={() => goTo(PAGES.Home)}
            >
            </img>
        );
    }
    
    return (
        <div className={navClass}>
            <div className={styles.leftContainer} onClick={() => goTo(PAGES.Home)}>
                {brandIcon()}
                <p className={styles.name}>{phrases.Name}</p>
            </div>
            <div className={`${styles.middleContainer}`}>
            </div>
            <div className={styles.directory}>
                {/* <p 
                    className={styles.redirect}
                    onClick={() => goTo(PAGES.Home)}
                >
                    {phrases.Projects}
                </p> */}
                <p 
                    className={styles.redirect}
                     onClick={() => goTo(PAGES.Posts)}
                >
                    {phrases.BlogPosts}
                </p>
                <p
                    className={styles.redirect}
                    onClick={() => goTo(PAGES.Coffee)}
                >
                    {phrases.Coffee}
                </p>
                {/* <p
                    className={styles.redirect} 
                    onClick={() => goTo(PAGES.Home)}
                >
                    {phrases.Hobbies}
                </p> */}
                {authControl()}
                {themeIcon()}
            </div>
        </div>

    );
}
