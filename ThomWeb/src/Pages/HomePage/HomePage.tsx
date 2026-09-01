import styles from "./HomePage.module.css";

export default function HomePage() {
  const resumeHref = `${process.env.PUBLIC_URL}/documents/curr_resume.pdf`;

  return (
    <div className={styles.text}>
        <p className={styles.header}>Hi, I'm Thomas.</p>
        <p>
          {"I'm a backend software engineer at Homes.com. Here's my "}
          <a
            className={styles.click}
            href={resumeHref}
            target="_blank"
            rel="noreferrer"
          >
            resume
          </a>
          .
        </p>
        <p>
          You can find my work on{" "}
          <a
            className={styles.click}
            href="https://github.com/thomhuang/"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          , and reach me via{" "}
          <a className={styles.click} href="mailto:thomaskhuangg@gmail.com">
            email
          </a>
          {" or "}
          <a
            className={styles.click}
            href="https://www.linkedin.com/in/thomaskhuang/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          .
        </p>
    </div>
  );
}
