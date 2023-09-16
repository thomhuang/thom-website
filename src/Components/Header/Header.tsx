import React, { useState, useEffect} from 'react';
import styles from './Headers.module.css';
// import stick_figure_up from './Assets/stick_figure_up.png'
// import stick_figure_down from './Assets/stick_figure_down.png'


export default function Header() {
    // TODO : MAKE STICK FIGURE MAN ON HEADER CHANGE!
    const [imageIndex, setImageIndex] = useState(true);

    //const images = [stick_figure_down, stick_figure_up];

    useEffect(() => {
        setInterval(() => {
            switchImage();
        }, 5000);
    });


    const switchImage = () => {
        setImageIndex(!imageIndex);
    }
    
    return (
        <div>
        <div className={`${styles.header} ${styles.sticky}`}>
            <div className={`${styles.leftContainer}`}>
                <a href='/'>Thomas Huang</a>
            </div>
            <div className={`${styles.middleContainer}`}>
            </div>
            <div className={`${styles.rightContainer}`}>
                <a href='/about'>About</a>
                <a href='/projects'>Projects</a>
                <a href='/hobbies'>Hobbies</a>
                <a href='/blogs'>Blog Posts</a>
            </div>
        </div>
        </div>

    );
}
