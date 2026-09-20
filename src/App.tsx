import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { PAGES } from './Assets/constants';
import styles from './App.module.css';
import { AuthProvider } from './Auth/AuthContext';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import Coffee from './Pages/Coffee/Coffee';
import CoffeeEntry from './Pages/Coffee/CoffeeEntry';
import ErrorPage from './Pages/ErrorPage/ErrorPage';
import HomePage from './Pages/HomePage/HomePage';
import Policies from './Pages/Policies/Policies';
import OrderConfirmation from './Pages/Shop/OrderConfirmation';
import OrderView from './Pages/Shop/OrderView';
import Shop from './Pages/Shop/Shop';
import ShopItem from './Pages/Shop/ShopItem';
import ShopItemForm from './Pages/Shop/ShopItemForm';
import ShopOrders from './Pages/Shop/ShopOrders';

const App = () => {
  return(
    <BrowserRouter>
      <AuthProvider>
        <div className={styles.container}>
          <Header/>
          <main className={styles.main}>
            <Routes>
              <Route path={PAGES.Home} Component={HomePage} />
              <Route path={PAGES.Coffee} Component={Coffee} />
              <Route path={PAGES.CoffeeEntry} Component={CoffeeEntry} />
              <Route
                path={`${PAGES.CoffeeEntry}/:entryId`}
                Component={CoffeeEntry}
              />
              <Route path={PAGES.Shop} Component={Shop} />
              <Route path={PAGES.ShopOrder} Component={OrderConfirmation} />
              <Route path={PAGES.OrderView} Component={OrderView} />
              <Route path={PAGES.ShopOrders} Component={ShopOrders} />
              <Route path={PAGES.Policies} Component={Policies} />
              <Route path={`${PAGES.ShopItem}/:itemId`} Component={ShopItem} />
              <Route path={PAGES.ShopEntry} Component={ShopItemForm} />
              <Route
                path={`${PAGES.ShopEntry}/:itemId`}
                Component={ShopItemForm}
              />
              <Route path={PAGES.Error} Component={ErrorPage} />
              <Route path="*" Component={ErrorPage} />
            </Routes>
          </main>
          <Footer/>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
