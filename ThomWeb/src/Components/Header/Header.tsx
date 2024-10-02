import { useEffect, useState } from 'react';
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
    const [navClass, SetNavClass] = useState('');
    const [iconClass, setIconClass] = useState('');
    const [figureClass, setFigureClass] = useState('');

    function setTheme() {
        dispatch(toggleTheme());
    }

    useEffect(() => {
        let navTheme = darkMode
        ? styles.darkNav 
        : styles.lightNav;

        let navClassList = [styles.header, navTheme];
        SetNavClass(navClassList.join(' '));

        let IconTheme = !darkMode
            ? ''
            : styles.lightIcon;

        let themeIconClass = [styles.icon, IconTheme];
        setIconClass(themeIconClass.join(' '));
        
        let figureIconClass = [styles.figure, IconTheme];
        setFigureClass(figureIconClass.join(' '));

    }, [darkMode]);

    function themeIcon() {
        let svg = darkMode
            ? <Sun className={iconClass} onClick={setTheme}/>
            : <Moon className={iconClass} onClick={setTheme}/>

        return svg
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
