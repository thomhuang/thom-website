import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import { useTheme } from '../../hooks';
import AuthControl from './AuthControl';
import styles from './Headers.module.css';

export default function Header() {
    const [theme, toggleTheme] = useTheme();

    return (
        <header className={styles.header}>
            <Link to={PAGES.Home} className={styles.name}>
                Thomas Huang
            </Link>
            <nav className={styles.nav}>
                <Link to={PAGES.Home} className={styles.navLink}>
                    home
                </Link>
                <Link to={PAGES.Coffee} className={styles.navLink}>
                    coffee
                </Link>
                <Link to={PAGES.Shop} className={styles.navLink}>
                    shop
                </Link>
                <AuthControl />
                <button
                    type="button"
                    className={styles.textButton}
                    onClick={toggleTheme}
                >
                    {theme === 'dark' ? 'light' : 'dark'}
                </button>
            </nav>
        </header>
    );
}
