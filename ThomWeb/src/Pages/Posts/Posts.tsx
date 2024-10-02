import CollapsibleSection from '../../Components/CollapsibleSection/CollapsibleSection';
import styles from './Posts.module.css';
import { useState, useEffect } from 'react';

import { GetCategoriesAsync, GetPostsAsync, Category, Post } from '../../api/Posts/PostsRouter'
import ErrorPage from '../ErrorPage/ErrorPage';


export default function Posts() {
    const [categories, setCategories] = useState<Category[] | undefined>([])

    useEffect(() => {
      const getPostsByCategory = async (categoryId: number) : Promise<Post[] | undefined> => {
        try {
          return await GetPostsAsync(categoryId)
        } catch (error) {
          console.error(`Failed to fetch posts for categoryId: ${categoryId}, %d`, error)
        }
      }

      const hydrateCategoriesWithPosts = async () => {
        try {
          const categoriesReponse = await GetCategoriesAsync()

          if (categoriesReponse !== undefined) {
            const hydratePostsForCategory = await Promise.all(categoriesReponse?.map(async (category : Category) => {
              const posts = await getPostsByCategory(category.ID)
              return { ...category, Posts: posts}
            }))

            setCategories(hydratePostsForCategory)
          }
        } catch (error) {
          console.error("Error fetching categories data: ", error)
        }
      }

      hydrateCategoriesWithPosts()

    }, []);

    function DisplayPosts() {
      if (categories === undefined || categories.length === 0){
        return <ErrorPage></ErrorPage>
      }
    
      return categories.map(item => (
        <CollapsibleSection
          title={item.Category}
          content={item.Posts}
          key={item.Category}
        />
      ))
    }

    return (
        <div className={styles.container}>
          {DisplayPosts()}
        </div>
      );
}