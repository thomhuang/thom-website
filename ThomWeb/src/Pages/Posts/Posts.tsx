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
  const [categories, setCategories] = useState<Category[] | undefined>([]);

  useEffect(() => {
    const getPostsByCategory = async (
      categoryId: number
    ): Promise<Post[] | undefined> => {
      try {
        return await GetPostsAsync(categoryId);
      } catch (error) {
        console.error(
          `Failed to fetch posts for categoryId: ${categoryId}, %d`,
          error
        );
      }
    };

    const hydrateCategoriesWithPosts = async (): Promise<
      Category[] | undefined
    > => {
      try {
        const categoriesResponse = await GetCategoriesAsync();

        if (categoriesResponse !== undefined) {
          return await Promise.all(
            categoriesResponse?.map(async (category: Category) => {
              const posts = await getPostsByCategory(category.ID);
              return { ...category, Posts: posts };
            })
          );
        }
      } catch (error) {
        console.error("Error fetching categories data: ", error);
      }
    };

    hydrateCategoriesWithPosts().then((r) => setCategories(r));
  }, []);

  function DisplayPosts() {
    if (categories === undefined || categories.length === 0) {
      return <ErrorPage></ErrorPage>;
    }

    return categories.map((item) => (
      <CollapsibleSection
        title={item.Category}
        content={item.Posts}
        key={item.Category}
      />
    ));
  }

  return <div className={styles.container}>{DisplayPosts()}</div>;
}