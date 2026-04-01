import { BrowserRouter, Route, Routes } from "react-router-dom";

import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import Project from "./Components/Project/Project";
import ErrorPage from "./Pages/ErrorPage/ErrorPage";
import HomePage from "./Pages/HomePage/HomePage";
import MobileHomePage from "./Pages/MobilePage/MobileHomePage";
import Posts from "./Pages/Posts/Posts";
import styles from "./App.module.css";

const App = () => {
  return (
    <BrowserRouter>
      <div className={styles.container}>
        <Header />
        <Routes>
          <Route path="/" Component={HomePage} />
          <Route path="/posts" Component={Posts} />
          <Route path="/posts/:pathName" Component={Project} />
          <Route path="/mobile" Component={MobileHomePage} />
          <Route path="/error" Component={ErrorPage} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;