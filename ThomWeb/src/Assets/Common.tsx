import { NavigateFunction } from 'react-router-dom';

import { PAGES } from './constants';
import projectPosts from './content.json';

export default function Navigate(navigate : NavigateFunction, page : string, segment?: string ) {
    switch (page) {
        case PAGES.Home:
            navigate(PAGES.Home)
            break
        case PAGES.Posts:
            const projectRoute = projectPosts.content.find(p => p.id === segment)?.id
            if (!projectRoute){
                navigate(PAGES.Posts)
                break;
            }
            navigate(`${PAGES.Posts}/${projectRoute}`)
            break;
        case PAGES.Hobbies:
            navigate(PAGES.Hobbies)
            break
        case PAGES.Contact:
            navigate(PAGES.Contact)
            break
        default:
            navigate(PAGES.Error)
            break;
    }
}