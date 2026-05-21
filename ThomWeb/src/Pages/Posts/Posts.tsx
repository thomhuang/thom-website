import CollapsibleSection from '../../Components/CollapsibleSection/CollapsibleSection';
import styles from './Posts.module.css';
import { useState, useEffect } from 'react';

import { GetCategoriesAsync, GetPostsAsync, Category, Post } from '../../api/Posts/PostsRouter'

type HydratedCategory = Omit<Category, 'Posts'> & {
    Posts: Post[]
}

export default function Posts() {
    const [categories, setCategories] = useState<HydratedCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      let isMounted = true;

      const getPostsByCategory = async (categoryId: number) : Promise<Post[]> => {
        try {
          const postsResponse = await GetPostsAsync(categoryId)
          return postsResponse ?? []
        } catch (error) {
          console.error(`Failed to fetch posts for categoryId: ${categoryId}, %d`, error)
          return []
        }
      }

      const hydrateCategoriesWithPosts = async () => {
        try {
          const categoriesResponse = await GetCategoriesAsync()

          if (categoriesResponse?.length) {
            const hydratePostsForCategory = await Promise.all(categoriesResponse.map(async (category : Category) => {
              const posts = await getPostsByCategory(category.ID)
              return { ...category, Posts: posts}
            }))

            if (isMounted) {
              setCategories(hydratePostsForCategory.filter(category => category.Posts.length > 0))
            }
          } else if (isMounted) {
            setCategories([])
          }
        } catch (error) {
          console.error("Error fetching categories data: ", error)
          if (isMounted) {
            setCategories([])
          }
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      }

      hydrateCategoriesWithPosts()

      return () => {
        isMounted = false;
      }
    }, []);

    function EmptyPosts() {
      return (
        <div className={styles.emptyState}>
          <h1>No posts yet!</h1>
          <p>There aren't any posts at the moment. Please check back soon.</p>
        </div>
      )
    }

    function DisplayPosts() {
      if (isLoading) {
        return <p className={styles.statusText}>Loading posts...</p>
      }

      if (categories.length === 0) {
        return <EmptyPosts></EmptyPosts>
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
