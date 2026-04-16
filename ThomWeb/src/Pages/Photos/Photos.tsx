import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PAGES } from "../../Assets/Common";
import { HasFirebaseConfig } from "../../api/Firebase/FirebaseClient";
import {
  GetPhotoListingsAsync,
  PhotoListing,
  ToPublicPhotoUrl,
} from "../../api/Photos/PhotoListingsRouter";
import ErrorPage from "../ErrorPage/ErrorPage";
import styles from "./Photos.module.css";

const hasAdminEmail = Boolean(process.env.REACT_APP_ADMIN_EMAIL?.trim());
const isLocalMode = process.env.REACT_APP_MODE === "local";
const isManifestMode = Boolean(process.env.REACT_APP_PHOTO_LISTINGS_URL);
const canCreatePhotoListing =
  HasFirebaseConfig && !isManifestMode && (isLocalMode || hasAdminEmail);

export default function Photos() {
  const [photos, setPhotos] = useState<PhotoListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    GetPhotoListingsAsync(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setPhotos(result);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch photo listings: ", error);
        if (!controller.signal.aborted) {
          setIsError(true);
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
    return <div className={styles.container}>Loading photos...</div>;
  }

  if (isError) {
    return <ErrorPage />;
  }

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Cloud photo listings</p>
        <h1>Photos</h1>
        <p>
          A product-listing style gallery that can be populated from a public
          JSON manifest hosted by Google Drive, S3, Cloudinary, or a similar
          provider.
        </p>
        {canCreatePhotoListing ? (
          <Link className={styles.createButton} to={PAGES.PhotoAdmin}>
            Create photo listing
          </Link>
        ) : null}
      </section>

      {photos.length > 0 ? (
        <section className={styles.grid} aria-label="Photo listings">
          {photos.map((photo) => {
            const imageUrl = ToPublicPhotoUrl(photo.ImageUrl);

            return (
              <article className={styles.card} key={photo.ID}>
                <img
                  className={styles.image}
                  src={imageUrl}
                  alt={photo.Title}
                  loading="lazy"
                />
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <h2>{photo.Title}</h2>
                    {photo.Price ? <p>{photo.Price}</p> : null}
                  </div>
                  <p className={styles.description}>{photo.Description}</p>

                  <div className={styles.meta}>
                    {photo.Provider ? <p>{photo.Provider}</p> : null}
                    {photo.UpdatedAt ? <p>{photo.UpdatedAt}</p> : null}
                  </div>

                  {photo.Tags && photo.Tags.length > 0 ? (
                    <ul className={styles.tags}>
                      {photo.Tags.map((tag) => (
                        <li key={`${photo.ID}-${tag}`}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}

                  {photo.Link ? (
                    <a
                      className={styles.link}
                      href={photo.Link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View source
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <p className={styles.emptyState}>
          No photo listings have been added yet.
        </p>
      )}
    </div>
  );
}
