import styles from "./HomePage.module.css";

export default function HomePage() {
  const resumeHref = `${process.env.PUBLIC_URL}/documents/curr_resume.pdf`;

  return (
    <div className={styles.container}>
      <div className={styles.text}>
        <p className={styles.header}>Hi! Welcome to my website. I'm Thomas.</p>
        <p>
          {"I'm a backend software engineer at Costar Group working on Homes. Here's my "}
          <a
            className={styles.click}
            href={resumeHref}
            target="_blank"
            rel="noreferrer"
          >
            resume
          </a>
          {" if you'd like to check it out. Also, feel free to roam around the website and check out what I've added so far :)"}
        </p>
        <p>
          Feel free to contact me via{" "}
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
          , and you can find some of my work on{" "}
          <a
            className={styles.click}
            href="https://github.com/thomhuang/"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
