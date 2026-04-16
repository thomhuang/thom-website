import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import {
  Content,
  GetPostContentByIdAsync,
  GetPostContentByPathNameAsync,
  Post,
} from "../../api/Posts/PostsRouter";
import ErrorPage from "../../Pages/ErrorPage/ErrorPage";
import styles from "./Project.module.css";

export interface IProject {
  title?: string;
  description?: string[];
  github?: string;
  imagePaths?: string[];
  pathName?: string;
}

export default function Project() {
  const { pathName } = useParams();
  const location = useLocation();
  const id = (location.state as { id?: number } | null)?.id;
  const [post, setPost] = useState<Post | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const GetPostContentById = async (
      postId: number
    ): Promise<Post | undefined> => {
      try {
        return await GetPostContentByIdAsync(postId, controller.signal);
      } catch (error) {
        console.error(`Failed to fetch posts for postId: ${postId}`, error);
      }
    };

    const GetPostContentByPathName = async (
      pathName: string | undefined
    ): Promise<Post | undefined> => {
      if (pathName === undefined) return;

      try {
        return await GetPostContentByPathNameAsync(pathName, controller.signal);
      } catch (error) {
        console.error(`Failed to fetch posts for pathName: ${pathName}`, error);
      }
    };

    const getPostContent = async () => {
      if (typeof id === "number") {
        const postContentById = await GetPostContentById(id);
        if (!controller.signal.aborted) {
          setPost(postContentById);
        }
      } else {
        const postContentByPath = await GetPostContentByPathName(pathName);
        if (!controller.signal.aborted) {
          setPost(postContentByPath);
        }
      }
    };

    getPostContent().finally(() => {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [pathName, id]);

  function DisplayText(content: Content) {
    if (content.Text.length <= 0) {
      return null;
    }

    return <p>{content.Text}</p>;
  }

  function DisplayImage(content: Content) {
    if (content.ImagePath.length <= 0) {
      return null;
    }

    return (
      <img
        className={styles.image}
        src={`${process.env.PUBLIC_URL}/${content.ImagePath}`}
        alt={`${post?.Title ?? "Post"} visual`}
        loading="lazy"
      />
    );
  }

  function GetContent() {
    return post?.Content?.map((currContent, idx) => {
      return (
        <div key={`${currContent.ID}-${idx}`}>
          {DisplayText(currContent)}
          {DisplayImage(currContent)}
        </div>
      );
    });
  }

  function HandleRedirect() {
    if (!post?.Link) {
      return;
    }

    window.open(post.Link, "_blank", "noopener,noreferrer");
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Loading post...</p>
      </div>
    );
  }

  return post ? (
    <div className={styles.container}>
      <button className={styles.headerButton} type="button" onClick={HandleRedirect}>
        <h1 className={styles.header}>{post.Title}</h1>
      </button>
      <div className={styles.body}>{GetContent()}</div>
    </div>
  ) : (
    <ErrorPage />
  );
}
