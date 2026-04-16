import { useLayoutEffect } from "react";
import { Link, NavLink } from "react-router-dom";

import { applyTheme, PAGES } from "../../Assets/Common";
import phrases from "../../Assets/en.json";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { useResizeListener } from "../../Hooks/resizeListener";
import { toggleTheme } from "../../Reducers/ThemeSlice";
import { ReactComponent as Moon } from "./Assets/moon.svg";
import HandsDown from "./Assets/stick_figure_down.png";
import HandsUp from "./Assets/stick_figure_up.png";
import { ReactComponent as Sun } from "./Assets/sun.svg";
import styles from "./Header.module.css";

export default function Header() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  useResizeListener();

  const handleThemeToggle = () => {
    applyTheme(darkMode ? "light" : "dark");
    dispatch(toggleTheme());
  };

  useLayoutEffect(() => {
    applyTheme(darkMode ? "dark" : "light");
  }, [darkMode]);

  const figureClass = [styles.figure, darkMode ? styles.figureDark : ""]
    .filter(Boolean)
    .join(" ");
  const iconClass = [styles.icon, darkMode ? styles.iconDark : ""]
    .filter(Boolean)
    .join(" ");
  const navClass = [styles.container, darkMode ? styles.darkNav : styles.lightNav]
    .filter(Boolean)
    .join(" ");

  const figure = darkMode ? HandsUp : HandsDown;
  return (
    <header className={styles.header}>
      <div className={navClass}>
        <Link to={PAGES.Home} className={styles.logo}>
          <img className={figureClass} src={figure} alt="Brand figure" />
          <p className={styles.name}>{phrases.Name}</p>
        </Link>

        <div className={styles.navSection}>
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <NavLink className={styles.navLink} to={PAGES.Posts}>
                  Posts
                </NavLink>
              </li>
              <li className={styles.navItem}>
                <NavLink className={styles.navLink} to={PAGES.Photos}>
                  Photos
                </NavLink>
              </li>
            </ul>
          </nav>
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleThemeToggle}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          >
            {darkMode ? <Sun className={iconClass} /> : <Moon className={iconClass} />}
          </button>
        </div>
      </div>
    </header>
  );
}
