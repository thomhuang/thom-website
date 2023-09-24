import React, { useEffect, useState } from 'react';
import styles from './HomePage.module.css';
import phrases from '../../Assets/en.json';
import me from './Assets/me.png';
import { useAppSelector } from '../../hooks';

export default function HomePage() {
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
                <p>{phrases.IntroMe}</p>
                <p>
                    {phrases.IntroCareer1}
                    <a className={styles.click} href="/">
                        {phrases.IntroResume}
                    </a>
                    {phrases.IntroCareer2}
                </p>
                <p>{phrases.IntroContact}</p>
            </div>
            <div>
            </div>
        </div>
    );
}