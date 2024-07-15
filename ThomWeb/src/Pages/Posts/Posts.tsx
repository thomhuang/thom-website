import content from '../../Assets/content.json';
import CollapsibleSection from '../../Components/CollapsibleSection/CollapsibleSection';
import { IContentSection } from '../../Components/ContentSection/ContentSection';
import styles from './Posts.module.css';

export default function Posts() {
    var testContent: { content: IContentSection[] } = content;
    return (
        <div className={styles.container}>
            <CollapsibleSection title="Projects" content={testContent.content}/>
        </div>
      );
}