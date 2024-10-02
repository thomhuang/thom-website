import { useEffect, useState } from 'react';

import phrases from '../../Assets/en.json';
import { useAppSelector } from '../../hooks';
import me from './Assets/me.png';
import styles from './HomePage.module.css';

export default function HomePage() {
    const darkMode = useAppSelector((state) => state.theme.darkMode);
    const [photoClass, setPhotoClass] = useState('');

    useEffect(() => {
        let photoClassList = [styles.homeButton];
        let currTheme = darkMode
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
                        href={process.env.PUBLIC_URL + 'curr_resume.pdf'}
                        target="_blank"
                        rel="noreferrer"
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