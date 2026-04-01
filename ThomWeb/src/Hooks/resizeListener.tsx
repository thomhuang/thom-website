import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { NavigatePage, PAGES, ToPage } from "../Assets/Common";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  updateDevicePlatform,
  updateLastLocation,
} from "../Reducers/UserContextSlice";

export function ResizeListener() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const location = useLocation();
  const userContext = useAppSelector((context) => context.userContext);

  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth < 768;

      if (userContext.isMobile !== isCurrentlyMobile) {
        dispatch(updateDevicePlatform()); // updates isMobile
        dispatch(updateLastLocation({ payload: location.pathname }));
      }

      // If resized to desktop and currently on MobileHome, redirect to lastLocation
      if (
        !isCurrentlyMobile &&
        location.pathname === ToPage(PAGES.MobileHome)
      ) {
        NavigatePage(nav, userContext.lastLocation ?? PAGES.Home);
      }

      // If resized to mobile and not on MobileHome, redirect to MobileHome
      else if (
        isCurrentlyMobile &&
        location.pathname !== ToPage(PAGES.MobileHome)
      ) {
        NavigatePage(nav, ToPage(PAGES.MobileHome));
      }
    };

    window.addEventListener("resize", handleResize);

    // Run on mount to set initial state
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [
    dispatch,
    location.pathname,
    nav,
    userContext.isMobile,
    userContext.lastLocation,
  ]);
}
