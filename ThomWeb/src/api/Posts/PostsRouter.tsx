import axios from 'axios';

const BASE_ROUTE = process.env.REACT_APP_API_URL

export interface Category {
    ID: number,
    Category: string,
    Posts?: Post[] | null
}

export interface Post {
    ID: number,
    CategoryID: number,
    Title: string,
    Summary: string,
    PathName: string,
    Content: Content[],
    Link: string
}

export interface Content {
    ID: number,
    PostID: number,
    Text: string,
    ImagePath: string
}

export async function GetCategoriesAsync(): Promise<Category[] | null> {
    const response = await axios({
        method: "GET",
        url: `${BASE_ROUTE}/categories`
    })

    return response.data
}

export async function GetPostsAsync(id: number): Promise<Post[] | null> {
    const response = await axios({
        method: "GET",
        params: {
            category: id
        },
        url: `${BASE_ROUTE}/post`,
        paramsSerializer: { 
            indexes: null
        }
    })

    return response.data
}

export async function GetPostContentByIdAsync(postId: number, signal?: AbortSignal) {
    const response = await axios({
        method: "GET",
        params: {
            post: postId
        },
        signal,
        url: `${BASE_ROUTE}/post/content/id`
    })

    return response.data
}

export async function GetPostContentByPathNameAsync(pathName: string, signal?: AbortSignal) {
    const response = await axios({
        method: "GET",
        params: {
            pathName: pathName
        },
        signal,
        url: `${BASE_ROUTE}/post/content/path`
    })

    return response.data
}
