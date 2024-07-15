import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import styles from './App.module.css';
import Header from './Components/Header/Header';
import Project from './Components/Project/Project';
import { useAppSelector } from './hooks';
import ErrorPage from './Pages/ErrorPage/ErrorPage';
import HomePage from './Pages/HomePage/HomePage';
import Posts from './Pages/Posts/Posts';

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
          <Route path ='/posts' Component={Posts}/>
          <Route path ='/posts/:id' Component={Project} />
          <Route path='/error' Component={ErrorPage} />
        </Routes>
      </div>
      </BrowserRouter>
  );
}

export default App;
 