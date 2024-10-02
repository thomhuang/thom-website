import React, { useEffect } from 'react';

import styles from './Button.module.css';

// just playing around right now this isn't real pretend this is fake!

export const enum Size {
    small,
    medium,
    large,
    custom
} 

interface IButton {
    text?: string,
    pill?: boolean,
    fill?: boolean,
    size?: Size;
}

export default function Button(props : IButton) {
    useEffect(() => {
        let classList = [styles.button];
        
        let sizeClass;
        switch (props.size) {
            case Size.small:
                sizeClass = styles.small;
                break;
            case Size.large:
                sizeClass = styles.large;
                break;
            case Size.medium:
            default:
                sizeClass = styles.medium;
                break;
        }
        classList.push(sizeClass);

        if (props.pill)
            classList.push(styles.pill);

        if (props.fill)
            classList.push(styles.fill);
    })
}