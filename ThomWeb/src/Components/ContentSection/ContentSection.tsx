import {useNavigate} from 'react-router-dom'

import styles from './ContentSection.module.css'
import {PAGES} from "../../Assets/Common";

export interface IContentSection {
    title?: string,
    id?: number,
    summary?: string,
    pathName?: string,
}

export default function ContentSection(props: IContentSection) {
    const navigate = useNavigate();

    function navigateToPost() {
        navigate(`${PAGES.Posts}/${props.pathName}`, {
            state: {
                id: props.id
            }
        })
    }

    return (<div className={styles.container} key={props.title}>
            <h1 className={styles.title} onClick={navigateToPost}>{props.title}</h1>
            <p className={styles.body}>{props.summary}</p>
        </div>);
}