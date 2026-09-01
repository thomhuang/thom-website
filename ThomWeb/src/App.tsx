import { BrowserRouter, Route, Routes } from 'react-router-dom';

import styles from './App.module.css';
import { AuthProvider } from './Auth/AuthContext';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import Coffee from './Pages/Coffee/Coffee';
import CoffeeEntry from './Pages/Coffee/CoffeeEntry';
import ErrorPage from './Pages/ErrorPage/ErrorPage';
import HomePage from './Pages/HomePage/HomePage';

const App = () => {
  return(
    <BrowserRouter>
      <AuthProvider>
        <div className={styles.container}>
          <Header/>
          <main className={styles.main}>
            <Routes>
              <Route path='/' Component={HomePage} />
              <Route path ='/coffee' Component={Coffee}/>
              <Route path ='/coffee/entry' Component={CoffeeEntry}/>
              <Route path ='/coffee/entry/:entryId' Component={CoffeeEntry}/>
              <Route path='/error' Component={ErrorPage} />
              <Route path='*' Component={ErrorPage} />
            </Routes>
          </main>
          <Footer/>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
