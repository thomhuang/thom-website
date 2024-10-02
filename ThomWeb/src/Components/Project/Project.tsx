import { useLocation, useParams } from 'react-router-dom';

import ErrorPage from '../../Pages/ErrorPage/ErrorPage';
import styles from './Project.module.css';
import { useEffect, useState } from 'react';
import { Content, Post, GetPostContentByIdAsync, GetPostContentByPathNameAsync } from '../../api/Posts/PostsRouter';

export interface IProject {
    title?: string,
    description?: string[],
    github?: string,
    imagePaths?: string[],
    pathName?: string
}

export default function Project() {
    const { pathName } = useParams()
    const { id }  = useLocation().state
    const [post, setPost] = useState<Post | undefined>()

    useEffect(() => {
        const GetPostContentById = async (postId: number) : Promise<Post | undefined> => {
            try {
              return await GetPostContentByIdAsync(postId)
            } catch (error) {
              console.error(`Failed to fetch posts for postId: ${postId}, %d`, error)
            }
        }

        const GetPostContentByPathName = async (pathName: string | undefined) : Promise<Post | undefined> => {
            if (pathName === undefined)
                return 

            try {
              return await GetPostContentByPathNameAsync(pathName)
            } catch (error) {
              console.error(`Failed to fetch posts for pathName: ${pathName}, %d`, error)
            }
        }

        const getPostContent = async() => {
            if (id !== null) {
                const postContentById = await GetPostContentById(id)

                setPost(postContentById)
            } else {
                const postContentByPath = await GetPostContentByPathName(pathName)

                setPost(postContentByPath)
            }
        }

        getPostContent()
    }, [pathName, id])

    function DisplayText(content : Content, idx: number) {
        if (content.Text.length <= 0) {
            return null
        }

        return (
            <p key={idx}> 
                { content.Text } 
            </p>
        )
    }

    function DisplayImage(content : Content, idx: number) {
        if (content.ImagePath.length <= 0) {
            return null
        }

        return (
            <img
                className={styles.image}
                key={idx}
                src={`${process.env.PUBLIC_URL}/${content.ImagePath}`}
                alt={content.ImagePath}
            /> 
        )
    }
    
    function GetContent() {
        return post?.Content?.map((currContent, idx) => {
            return (
                <>
                    {DisplayText(currContent, idx)}
                    {DisplayImage(currContent, idx)}
                </>
            )
        }
        )
    }

    function HandleRedirect() {
        window.open(post?.Link, "_blank")
    }

    return (
        post ? (
            <div className={styles.container}>
                <h1 className={styles.header} onClick={HandleRedirect}>{post.Title}</h1>
                <div className={styles.body}>
                    {GetContent()}
                </div>
            </div>  
        )
        : <ErrorPage/>
    );
}