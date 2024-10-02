import { useEffect, useState } from 'react';

import {ReactComponent as ArrowDown} from './Assets/arrow-down.svg'
import ContentSection from '../ContentSection/ContentSection';
import styles from './CollapsibleSection.module.css';
import { Post } from '../../api/Posts/PostsRouter';
import { useAppSelector } from '../../hooks';

interface ICollapsibleSection {
    title?: string,
    content?: Post[]
}

export default function CollapsibleSection(props: ICollapsibleSection) {
    const darkMode = useAppSelector((state) => state.theme.darkMode);
    const [arrowClass, setArrowClass] = useState('')
    const [isOpen, setOpen] = useState(false);

    function toggleCollapsible() {
        setOpen(!isOpen);
    }

    useEffect(() => {
        const navTheme = darkMode
            ? styles.darkArrow 
            : styles.lightArrow;

        let iconFlip = isOpen
            ? styles.flipIcon
            : ''

        const arrowClassList = [styles.icon, navTheme, iconFlip]
        setArrowClass(arrowClassList.join(' '))
    }, [darkMode, isOpen])


    function themeIcon() {
        return <ArrowDown className={arrowClass}></ArrowDown>
    }

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
            ))
        }
    }

    return(
        <div className={styles.container}>
            <div className={styles.title} onClick={toggleCollapsible}>
                {themeIcon()}
                <h1>{props.title}</h1>
            </div>
            {displayContent()}
      </div>
    )
}