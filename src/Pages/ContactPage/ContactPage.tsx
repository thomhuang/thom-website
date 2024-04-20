import React from "react";
import styles from './ContactPage.module.css';
import phrases from '../../Assets/en.json';

export default function ContactPage() {

    return (
        <div className={styles.container}>
            <h1>{phrases.Contact}</h1>
            <p></p>
        </div>
    );
}