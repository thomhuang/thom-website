import { BrowserRouter, Route, Routes } from "react-router-dom";

import { PAGES } from "./Assets/Common";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import Project from "./Components/Project/Project";
import ErrorPage from "./Pages/ErrorPage/ErrorPage";
import HomePage from "./Pages/HomePage/HomePage";
import MobileHomePage from "./Pages/MobilePage/MobileHomePage";
import PhotoAdmin from "./Pages/PhotoAdmin/PhotoAdmin";
import Photos from "./Pages/Photos/Photos";
import Posts from "./Pages/Posts/Posts";
import styles from "./App.module.css";

const App = () => {
  return (
    <BrowserRouter>
      <div className={styles.container}>
        <Header />
        <main>
          <Routes>
            <Route path={PAGES.Home} Component={HomePage} />
            <Route path={PAGES.Posts} Component={Posts} />
            <Route path={`${PAGES.Posts}/:pathName`} Component={Project} />
            <Route path={PAGES.Photos} Component={Photos} />
            <Route path={PAGES.PhotoAdmin} Component={PhotoAdmin} />
            <Route path={PAGES.MobileHome} Component={MobileHomePage} />
            <Route path={PAGES.Error} Component={ErrorPage} />
            <Route path="*" Component={ErrorPage} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
