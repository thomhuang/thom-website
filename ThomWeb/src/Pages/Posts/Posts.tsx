import { useEffect, useState } from "react";

import {
  Category,
  GetCategoriesAsync,
  GetPostsAsync,
  Post,
} from "../../api/Posts/PostsRouter";
import CollapsibleSection from "../../Components/CollapsibleSection/CollapsibleSection";
import ErrorPage from "../ErrorPage/ErrorPage";
import styles from "./Posts.module.css";

export default function Posts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const getPostsByCategory = async (
      categoryId: number
    ): Promise<Post[] | undefined> => {
      try {
        return await GetPostsAsync(categoryId, controller.signal);
      } catch (error) {
        console.error(
          `Failed to fetch posts for categoryId: ${categoryId}`,
          error
        );
      }
    };

    const hydrateCategoriesWithPosts = async (): Promise<
      Category[] | undefined
    > => {
      try {
        const categoriesResponse = await GetCategoriesAsync(controller.signal);

        if (categoriesResponse === undefined) {
          return [];
        }

        return await Promise.all(
          categoriesResponse.map(async (category: Category) => {
            const posts = await getPostsByCategory(category.ID);
            return { ...category, Posts: posts ?? [] };
          })
        );
      } catch (error) {
        console.error("Error fetching categories data: ", error);
        setIsError(true);
        return [];
      }
    };

    hydrateCategoriesWithPosts()
      .then((result) => {
        if (!controller.signal.aborted) {
          setCategories(result ?? []);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  if (isLoading) {
    return <div className={styles.container}>Loading posts...</div>;
  }

  if (isError || categories.length === 0) {
    return <ErrorPage />;
  }

  return (
    <div className={styles.container}>
      {categories.map((item) => (
      <CollapsibleSection
        title={item.Category}
        content={item.Posts}
        key={item.Category}
      />
      ))}
    </div>
  );
}
