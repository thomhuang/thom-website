import { useState } from 'react';

import ContentSection, { IContentSection } from '../ContentSection/ContentSection';
import styles from './CollapsibleSection.module.css';

interface ICollapsibleSection {
    title?: string,
    content?: IContentSection[]
}

export default function CollapsibleSection(props : ICollapsibleSection) {
    const [isOpen, setOpen] = useState(false);
    function toggleCollapsible() {
        setOpen(!isOpen);
    }

    function displayContent() {
        if (isOpen) {
            return props.content?.map((item, idx) => (
                <ContentSection 
                    title={item.title} 
                    summary={item.summary} 
                    id={item.id}
                    key={idx}    
                />
            ))
        }
    }

    return(
        <div className={styles.container}>
        <h1 onClick={toggleCollapsible}>{props.title}</h1>
            {displayContent()}
      </div>
    )
}