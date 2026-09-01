import styles from './Footer.module.css';

export default function Footer() {
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
            <span className={styles.copyright}>&copy; Thomas Huang</span>
        </footer>
    );
}
