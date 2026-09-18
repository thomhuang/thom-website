import { BrowserRouter, Route, Routes } from 'react-router-dom';

import styles from './App.module.css';
import { AuthProvider } from './Auth/AuthContext';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import Coffee from './Pages/Coffee/Coffee';
import CoffeeEntry from './Pages/Coffee/CoffeeEntry';
import ErrorPage from './Pages/ErrorPage/ErrorPage';
import HomePage from './Pages/HomePage/HomePage';
import OrderConfirmation from './Pages/Shop/OrderConfirmation';
import Shop from './Pages/Shop/Shop';
import ShopItem from './Pages/Shop/ShopItem';
import ShopItemForm from './Pages/Shop/ShopItemForm';

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
              <Route path='/shop' Component={Shop} />
              <Route path='/shop/order' Component={OrderConfirmation} />
              <Route path='/shop/item/:itemId' Component={ShopItem} />
              <Route path='/shop/entry' Component={ShopItemForm} />
              <Route path='/shop/entry/:itemId' Component={ShopItemForm} />
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
