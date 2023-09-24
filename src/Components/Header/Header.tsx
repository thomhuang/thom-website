import React, { useState, useEffect} from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import styles from './Headers.module.css';
import phrases from '../../Assets/en.json'
import { toggleTheme } from '../../Reducers/themeSlice';
import { PAGES } from '../../Assets/constants';
import { ReactComponent as Sun } from "./Assets/sun.svg";
import { ReactComponent as Moon } from "./Assets/moon.svg";
import HandsUp from './Assets/stick_figure_up.png'
import HandsDown from './Assets/stick_figure_down.png'


export default function Header({switchTheme} : any) {
    const dispatch = useAppDispatch();
    const darkMode = useAppSelector((state) => state.theme.darkMode);
    const navigate = useNavigate();
    const [navClass, SetNavClass] = useState('');
    const [iconClass, setIconClass] = useState('');
    const [figureClass, setFigureClass] = useState('');

    function setTheme() {
        dispatch(toggleTheme());
    }

    function Navigate(page : PAGES) {
        switch (page) {
            case PAGES.Home:
                navigate(PAGES.Home);
                break;
            case PAGES.BlogPosts:
                navigate(PAGES.BlogPosts);
                break;
            case PAGES.Hobbies:
                navigate(PAGES.Hobbies);
                break;
            case PAGES.Contact:
                navigate(PAGES.Contact);
                break;
            default:
                navigate(PAGES.Error);
                break;
        }
    }

    useEffect(() => {
        var navTheme = darkMode
        ? styles.darkNav 
        : styles.lightNav;

        var navClassList = [styles.header, navTheme];
        SetNavClass(navClassList.join(' '));

        var IconTheme = !darkMode
            ? ''
            : styles.lightIcon;

        var themeIconClass = [styles.icon, IconTheme];
        setIconClass(themeIconClass.join(' '));
        
        var figureIconClass = [styles.figure, IconTheme];
        setFigureClass(figureIconClass.join(' '));

    }, [darkMode]);

    function themeIcon() {
        return darkMode
            ? <Sun className={iconClass} onClick={setTheme}/>
            : <Moon className={iconClass} onClick={setTheme}/>
    }


    function brandIcon() {
        var figure = darkMode
            ? HandsUp
            : HandsDown;

        return (
            <img
                className={figureClass}
                src={figure}
                alt='figure'
                onClick={() => Navigate(PAGES.Home)}
            >
            </img>
        );
    }
    
    return (
        <div className={navClass}>
            <div className={styles.leftContainer}>
                {brandIcon()}
                <p className={styles.name} onClick={() => Navigate(PAGES.Home)}>{phrases.Name}</p>
            </div>
            <div className={`${styles.middleContainer}`}>
            </div>
            <div className={styles.directory}>
                <p onClick={() => Navigate(PAGES.Projects)}>{phrases.Projects}</p>
                <p onClick={() => Navigate(PAGES.BlogPosts)}>{phrases.BlogPosts}</p>
                <p onClick={() => Navigate(PAGES.Hobbies)}>{phrases.Hobbies}</p>
                <p onClick={() => Navigate(PAGES.Contact)}>{phrases.Contact}</p>
                {themeIcon()}
            </div>
        </div>

    );
}
