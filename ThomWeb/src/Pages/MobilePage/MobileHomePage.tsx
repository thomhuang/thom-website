import phrases from '../../Assets/en.json';
import styles from './MobileHomePage.module.css';

export default function HomePage() {
    return (<div className={styles.container}>
        <div className={styles.text}>
            <p className={styles.header}>{phrases.MobileHomepage}</p>
        </div>
    </div>);
}