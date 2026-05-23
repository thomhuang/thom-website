import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import styles from './App.module.css';
import { AuthProvider } from './Auth/AuthContext';
import Header from './Components/Header/Header';
import Project from './Components/Project/Project';
import { useAppSelector } from './hooks';
import Coffee from './Pages/Coffee/Coffee';
import CoffeeEntry from './Pages/Coffee/CoffeeEntry';
import ErrorPage from './Pages/ErrorPage/ErrorPage';
import HomePage from './Pages/HomePage/HomePage';
import Posts from './Pages/Posts/Posts';

const App = () => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const themeClass = [
    styles.container,
    darkMode ? styles.dark : styles.light,
  ].join(' ');

  useEffect(() => {
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return(
      <BrowserRouter> 
      <div className={themeClass}>
        <AuthProvider>
          <Header/>
          <Routes>
            <Route path='/' Component={HomePage} />
            <Route path ='/coffee' Component={Coffee}/>
            <Route path ='/coffee/entry' Component={CoffeeEntry}/>
            <Route path ='/coffee/entry/:entryId' Component={CoffeeEntry}/>
            <Route path ='/posts' Component={Posts}/>
            <Route path ='/posts/:pathName' Component={Project} />
            <Route path='/error' Component={ErrorPage} />
          </Routes>
        </AuthProvider>
      </div>
      </BrowserRouter>
  );
}

export default App;
 
