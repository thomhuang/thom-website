import React from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom';
import Header from './Components/Header/Header';
import HomePage from './Pages/HomePage/HomePage';
import ErrorPage from './Pages/ErrorPage/ErrorPage';

const App = () => {
  return(
      <BrowserRouter>
        <Header/>
        <Routes>
          <Route path='/' Component={HomePage} />
          <Route path='/*' Component={ErrorPage} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
 