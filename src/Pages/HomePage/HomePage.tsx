import React from 'react';
import styles from './HomePage.module.css';
import phrases from '../../Assets/en.json';
import me from './Assets/me.png';

export default function HomePage() {
    
    return(
        <div className={styles.container}>
            <div>
            </div>
            <div className={styles.centerContainer}>
                <img src={me} alt='me'></img>
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