import type { NavigateFunction } from "react-router-dom";

export const applyTheme = (theme: "light" | "dark"): void => {
  document.body.setAttribute("data-theme", theme);
};

export enum PAGES {
  Home = "/",
  Posts = "/posts",
  Photos = "/photos",
  PhotoAdmin = "/photos/admin",
  Projects = "/projects",
  MobileHome = "/mobile",
  Error = "/error",
}

export const ToPage = (page: PAGES): string => {
  return page;
};

export const NavigatePage = (
  navigate: NavigateFunction,
  page: string
): void => {
  navigate(page);
};
