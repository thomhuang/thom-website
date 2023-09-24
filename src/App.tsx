import React, { useEffect, useState } from 'react';
import styles from './App.module.css';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';
import Header from './Components/Header/Header';
import HomePage from './Pages/HomePage/HomePage';
import ErrorPage from './Pages/ErrorPage/ErrorPage';
import { useAppSelector } from './hooks';

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
          <Route path='/*' Component={ErrorPage} />
        </Routes>
      </div>
      </BrowserRouter>
  );
}

export default App;
 