import { Link } from 'react-router-dom';

import { PAGES } from '../../Assets/constants';
import styles from './Footer.module.css';

// Public assets are served from the root, so we only need the glob's keys to
// discover the newest document and link to it directly. Importing them would
// make Vite try to process files that already live in `public/`.
const documents = import.meta.glob('/public/documents/*');

export default function Footer() {
    const files = Object.keys(documents).sort();
    const resumeHref = (files[files.length - 1] ?? '').replace('/public/', '/');

    return (
        <footer className={styles.footer}>
            <a
                className={styles.link}
                href="https://github.com/thomhuang/"
                target="_blank"
                rel="noreferrer"
            >
                github
            </a>
            <span className={styles.sep}>&middot;</span>
            <a
                className={styles.link}
                href="https://www.linkedin.com/in/thomaskhuang/"
                target="_blank"
                rel="noreferrer"
            >
                linkedin
            </a>
            <span className={styles.sep}>&middot;</span>
            <a
                className={styles.link}
                href="mailto:thomaskhuangg@gmail.com"
            >
                email
            </a>
            <span className={styles.sep}>&middot;</span>
            <a
                className={styles.link}
                href={resumeHref}
                target="_blank"
                rel="noreferrer"
            >
                resume
            </a>
            <span className={styles.sep}>&middot;</span>
            <Link className={styles.link} to={PAGES.Policies}>
                policies
            </Link>
            <span className={styles.sep}>&middot;</span>
            <span className={styles.copyright}>&copy; Thomas Huang</span>
        </footer>
    );
}
