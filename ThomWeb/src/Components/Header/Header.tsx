import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
    NavigatePage,
    PAGES,
    setDarkTheme,
    setLightTheme,

} from '../../Assets/Common';
import phrases from '../../Assets/en.json';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toggleTheme } from '../../Reducers/ThemeSlice';
import { ReactComponent as Moon } from './Assets/moon.svg';
import HandsDown from './Assets/stick_figure_down.png';
import HandsUp from './Assets/stick_figure_up.png';
import { ReactComponent as Sun } from './Assets/sun.svg';
import styles from './Header.module.css';
import {ResizeListener} from "../../Hooks/resizeListener";

export default function Header() {
    const dispatch = useAppDispatch();
    const nav = useNavigate();
    const darkMode = useAppSelector((state) => state.theme.darkMode);
    ResizeListener();

    const handleThemeToggle = () => {
        dispatch(toggleTheme());
    };

    const figureStyling = [styles.figure];
    const iconStyling = [styles.icon];
    const navStyling = [styles.container];

    if (darkMode) {
        setDarkTheme()
        figureStyling.push(styles.figureDark)
        iconStyling.push(styles.iconDark)
        navStyling.push(styles.darkNav)
    } else {
        setLightTheme()
        navStyling.push(styles.lightNav)
    }

    const renderThemeIcon = () => {
        const iconClass = iconStyling.join(' ');
        return darkMode ? (
            <Sun className={iconClass} onClick={handleThemeToggle} />
        ) : (
            <Moon className={iconClass} onClick={handleThemeToggle} />
        );
    };

    const renderBrandIcon = () => {
        const figure = darkMode ? HandsUp : HandsDown;
        const figureClass = figureStyling.join(' ');
        return (
            <img
                className={figureClass}
                src={figure}
                alt="Brand figure"
            />
        );
    };

    const navClass = navStyling.join(' ');
    return (
        <header className={styles.header}>
            <div className={navClass}>
                <a href={PAGES.Home} className={styles.logo}>
                {renderBrandIcon()}
                <p className={styles.name}>{phrases.Name}</p>
                </a>

                <div className={styles.navSection}>
                    <nav className={styles.nav}>
                        <ul className={styles.navList}>
                            <li className={styles.navItem}>
                                <a className={styles.navLink} href={PAGES.Posts}>Posts</a>
                            </li>
                        </ul>
                    </nav>
                    {renderThemeIcon()}
                </div>
            </div>
        </header>
    );
}
