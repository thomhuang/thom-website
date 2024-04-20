import React, { useState } from 'react';
import styles from './CollapsibleSection.module.css';

interface ICollapsibleSection {
    title?: string,
}
export default function CollapsibleSection(props : ICollapsibleSection) {
    const [isOpen, setOpen] = useState(false);
    function toggleCollapsible() {
        setOpen(!isOpen);
    }

    function ContentSection() {
        return (
            <div className={styles.section}>
                Section
            </div>
        )
    }

    return(
        <div className={styles.container}>
        <h1 onClick={toggleCollapsible}>{props.title}</h1>
            {isOpen && ContentSection()}
      </div>
    )
}