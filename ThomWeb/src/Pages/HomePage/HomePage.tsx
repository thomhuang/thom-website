import { Link } from "react-router-dom";

import { PAGES } from "../../Assets/constants";
import styles from "./HomePage.module.css";

const documents = import.meta.glob("/public/documents/*", {
  eager: true,
  query: "?url",
  import: "default",
});

export default function HomePage() {
  const files = Object.values(documents).sort();
  const resumeHref = (files[files.length - 1] ?? "").replace("/public", "");

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
          Feel free to check out my{" "}
          <Link className={styles.click} to={PAGES.Coffee}>
            coffee log
          </Link>{" "}
          and my{" "}
          <Link className={styles.click} to={PAGES.Shop}>
            shop
          </Link>
          , where I'll be selling random things of mine.
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
