import { useNavigate } from 'react-router-dom';

import Navigate from '../../Assets/Common';
import { PAGES } from '../../Assets/constants';
import styles from './ContentSection.module.css';

export interface IContentSection {
    title?: string,
    summary?: string,
    id?: string
}

export default function ContentSection(props: IContentSection) {
    const nav = useNavigate();
    return (
        <div className={styles.container}>
            <h1 className={styles.title} onClick={() => Navigate(nav, PAGES.Posts, props.id)}>{props.title}</h1>
            <p className={styles.body}>{props.summary}</p>
        </div>
    );
}