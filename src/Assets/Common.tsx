import { NavigateFunction } from "react-router-dom";
import { PAGES } from "./constants";


export default function Navigate(navigate : NavigateFunction, page : PAGES) {
    switch (page) {
        case PAGES.Home:
            navigate(PAGES.Home);
            break;
        case PAGES.BlogPosts:
            navigate(PAGES.BlogPosts);
            break;
        case PAGES.Hobbies:
            navigate(PAGES.Hobbies);
            break;
        case PAGES.Contact:
            navigate(PAGES.Contact);
            break;
        default:
            navigate(PAGES.Error);
            break;
    }
}