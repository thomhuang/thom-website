import styles from './ErrorPage.module.css';

export default function ErrorPage() {
  return (
    <div className={styles.container}>
        <h1>Oops!</h1>
        <p>This page doesn't exist yet, or will never ... Sorry!</p>
    </div>
  );
}