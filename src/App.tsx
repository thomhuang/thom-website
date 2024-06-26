import React, { useEffect, useState } from 'react';
import { useAppSelector } from './hooks';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';
import styles from './App.module.css';
import Header from './Components/Header/Header';
import HomePage from './Pages/HomePage/HomePage';
import ErrorPage from './Pages/ErrorPage/ErrorPage';
import ContactPage from './Pages/ContactPage/ContactPage';
import BlogPosts from './Pages/BlogPosts/BlogPosts';


const App = () => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const [themeClass, setThemeClass] = useState('');

  useEffect(() => {
    var appClassList = [styles.container]
    
    var currTheme = darkMode
      ? styles.dark 
      : styles.light; 
    appClassList.push(currTheme);
    
      setThemeClass(appClassList.join(' '));
  }, [darkMode, themeClass])

  return(
      <BrowserRouter>
      <div className={themeClass}>
        <Header/>
        <Routes>
          <Route path='/' Component={HomePage} />
          <Route path ='/contact' Component={ContactPage} />
          <Route path ='/blog-posts' Component={BlogPosts} />
          <Route path='/*' Component={ErrorPage} />
        </Routes>
      </div>
      </BrowserRouter>
  );
}

export default App;
 