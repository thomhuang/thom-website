import { useState } from "react";

import { Post } from "../../api/Posts/PostsRouter";
import { useAppSelector } from "../../hooks";
import ContentSection from "../ContentSection/ContentSection";
import { ReactComponent as ArrowDown } from "./Assets/arrow-down.svg";
import styles from "./CollapsibleSection.module.css";

interface ICollapsibleSection {
  title?: string;
  content?: Post[];
}

export default function CollapsibleSection(props: ICollapsibleSection) {
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const [isOpen, setOpen] = useState(false);

  const toggleCollapsible = () => {
    setOpen((prev) => !prev);
  };

  const arrowClass = [
    styles.icon,
    darkMode ? styles.darkArrow : styles.lightArrow,
    isOpen ? styles.flipIcon : "",
  ]
    .filter(Boolean)
    .join(" ");

  function displayContent() {
    if (isOpen) {
      return props?.content?.map((item) => (
        <ContentSection
          title={item.Title}
          id={item.ID}
          summary={item.Summary}
          pathName={item.PathName}
          key={item.PathName}
        />
      ));
    }
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.title} ${styles.arrowButton}`}
        onClick={toggleCollapsible}
        aria-expanded={isOpen}
      >
        <ArrowDown className={arrowClass} />
        <h1>{props.title}</h1>
      </button>
      {displayContent()}
    </div>
  );
}
