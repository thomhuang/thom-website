import { useNavigate } from 'react-router-dom';

import Navigate from '../../Assets/Common';
import { PAGES } from '../../Assets/constants';
import phrases from '../../Assets/en.json';
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
    const iconThemeClass = darkMode ? styles.lightIcon : '';
    const navClass = [
        styles.header,
        darkMode ? styles.darkNav : styles.lightNav,
    ].join(' ');
    const figureClass = [styles.figure, iconThemeClass].join(' ');

    function setTheme() {
        dispatch(toggleTheme());
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


    function brandIcon() {
        let figure = darkMode
            ? HandsUp
            : HandsDown;

        return (
            <img
                className={figureClass}
                src={figure}
                alt='figure man'
                onClick={() => Navigate(nav, PAGES.Home)}
            >
            </img>
        );
    }
    
    return (
        <div className={navClass}>
            <div className={styles.leftContainer} onClick={() => Navigate(nav, PAGES.Home)}>
                {brandIcon()}
                <p className={styles.name}>{phrases.Name}</p>
            </div>
            <div className={`${styles.middleContainer}`}>
            </div>
            <div className={styles.directory}>
                {/* <p 
                    className={styles.redirect}
                    onClick={() => Navigate(nav, PAGES.Home)}
                >
                    {phrases.Projects}
                </p> */}
                <p 
                    className={styles.redirect}
                     onClick={() => Navigate(nav, PAGES.Posts)}
                >
                    {phrases.BlogPosts}
                </p>
                {/* <p
                    className={styles.redirect} 
                    onClick={() => Navigate(nav, PAGES.Home)}
                >
                    {phrases.Hobbies}
                </p> */}
                {themeIcon()}
            </div>
        </div>

    );
}
