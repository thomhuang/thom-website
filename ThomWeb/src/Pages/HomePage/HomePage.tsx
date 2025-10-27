import phrases from '../../Assets/en.json';
import styles from './HomePage.module.css';

export default function HomePage() {
    return (<div className={styles.container}>
            <div className={styles.text}>
                <p className={styles.header}>{phrases.IntroMe}</p>
                <p>
                    {phrases.IntroCareer1}
                    <a className={styles.click} href={process.env.PUBLIC_URL + 'curr_resume.pdf'} target="_blank" rel="noreferrer">
                        {phrases.IntroResume}
                    </a>
                    {phrases.IntroCareer2}
                </p>
                <p>{phrases.IntroCareer3}</p>
            </div>
        </div>);
}