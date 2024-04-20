import React from "react";
import styles from './BlogPosts.module.css'
import CollapsibleSection from "../../Components/CollapsibleSection/CollapsibleSection";

export default function BlogPosts() {
    return (
        <div className={styles.container}>
            <CollapsibleSection title="Projects"/>
            <CollapsibleSection title="Personal Posts"/>
            <CollapsibleSection title = "Test"/>
        </div>
      );
}