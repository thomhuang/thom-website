import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { NavigatePage, PAGES, ToPage } from "../Assets/Common";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  updateDevicePlatform,
  updateLastLocation,
} from "../Reducers/UserContextSlice";

export function useResizeListener() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const location = useLocation();
  const { isMobile, lastLocation } = useAppSelector(
    (context) => context.userContext
  );

  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth < 768;

      if (isMobile !== isCurrentlyMobile) {
        dispatch(updateDevicePlatform(isCurrentlyMobile));
      }

      if (!isCurrentlyMobile && location.pathname !== ToPage(PAGES.MobileHome)) {
        dispatch(updateLastLocation(location.pathname));
      }

      // If resized to desktop and currently on MobileHome, redirect to lastLocation
      if (
        !isCurrentlyMobile &&
        location.pathname === ToPage(PAGES.MobileHome)
      ) {
        NavigatePage(nav, lastLocation || PAGES.Home);
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
  }, [dispatch, isMobile, lastLocation, location.pathname, nav]);
}
