import React, { useEffect, useState } from 'react';
import styles from './HomePage.module.css';
import phrases from '../../Assets/en.json';
import me from './Assets/me.png';
import { useAppSelector } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import Navigate from '../../Assets/Common';
import { PAGES } from '../../Assets/constants';

export default function HomePage() {
    const nav = useNavigate();
    const darkMode = useAppSelector((state) => state.theme.darkMode);
    const [photoClass, setPhotoClass] = useState('');


    useEffect(() => {
        var photoClassList = [];
        var currTheme = darkMode
            ? styles.dark
            : styles.light;
            photoClassList.push(currTheme, styles.headshot);
        setPhotoClass(photoClassList.join(' '));
    }, [darkMode])

    
    return(
        <div className={styles.container}>
            <div>
            </div>
            <div className={styles.centerContainer}>
                <img className={photoClass} src={me} alt='me'></img>
                <p className={styles.text}>{phrases.IntroMe}</p>
                <p className={styles.text}>
                    {phrases.IntroCareer1}
                    <a 
                        className={styles.click} 
                        onClick={() => Navigate(nav, PAGES.Home)}
                        href='/'
                    >
                        {phrases.IntroResume}
                    </a>
                    {phrases.IntroCareer2}
                </p>
                <p className={styles.text}>{phrases.IntroContact}</p>
            </div>
            <div>
            </div>
        </div>
    );
}