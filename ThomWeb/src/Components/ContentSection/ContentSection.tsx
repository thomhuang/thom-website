import { Link } from "react-router-dom";

import { PAGES } from "../../Assets/Common";
import styles from "./ContentSection.module.css";

export interface IContentSection {
  title?: string;
  id?: number;
  summary?: string;
  pathName?: string;
}

export default function ContentSection(props: IContentSection) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Link
          to={`${PAGES.Posts}/${props.pathName ?? ""}`}
          state={{ id: props.id }}
          className={styles.postLink}
        >
          {props.title}
        </Link>
      </h2>
      <p className={styles.body}>{props.summary}</p>
    </div>
  );
}
