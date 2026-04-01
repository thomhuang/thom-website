import { NavigateFunction } from "react-router-dom";

export const setLightTheme = () => {
  document.getElementsByTagName("body")[0].setAttribute("data-theme", "light");
};

export const setDarkTheme = () => {
  document.getElementsByTagName("body")[0].setAttribute("data-theme", "dark");
};

export enum PAGES {
  Home = "/",
  Posts = "/posts",
  Projects = "/projects",
  MobileHome = "/mobile",
  Error = "/error",
}

export const ToPage = (page: PAGES): string => {
  switch (page) {
    case PAGES.Home:
      return "/";
    case PAGES.MobileHome:
      return "/mobile";
    case PAGES.Projects:
      return "/projects";
    case PAGES.Posts:
      return "/posts";
    case PAGES.Error:
    default:
      return "/error";
  }
};

export const NavigatePage = (
  navigate: NavigateFunction,
  page: string
): void => {
  navigate(page);
};