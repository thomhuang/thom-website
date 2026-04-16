import { FormEvent, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";

import {
  CreatePhotoListingAsync,
  NewPhotoListing,
} from "../../api/Photos/PhotoListingsRouter";
import {
  FirebaseAuth,
  GoogleProvider,
  HasFirebaseConfig,
} from "../../api/Firebase/FirebaseClient";
import ErrorPage from "../ErrorPage/ErrorPage";
import styles from "./PhotoAdmin.module.css";

const adminEmail = process.env.REACT_APP_ADMIN_EMAIL?.trim().toLowerCase();
const isLocalMode = process.env.REACT_APP_MODE === "local";

type EditablePhotoListingField = Exclude<keyof NewPhotoListing, "Tags">;

const getDefaultListing = (): NewPhotoListing => {
  return {
    Title: "",
    Description: "",
    ImageUrl: "",
    Provider: "Google Drive",
    Price: "",
    Tags: [],
    UpdatedAt: new Date().toISOString().slice(0, 10),
    Link: "",
  };
};

const toTags = (value: string): string[] => {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const toCleanListing = (
  listing: NewPhotoListing,
  tagInput: string
): NewPhotoListing => {
  return {
    Title: listing.Title.trim(),
    Description: listing.Description.trim(),
    ImageUrl: listing.ImageUrl.trim(),
    Provider: listing.Provider?.trim(),
    Price: listing.Price?.trim(),
    Tags: toTags(tagInput),
    UpdatedAt: listing.UpdatedAt?.trim(),
    Link: listing.Link?.trim(),
  };
};

export default function PhotoAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [listing, setListing] = useState<NewPhotoListing>(getDefaultListing);
  const [tagInput, setTagInput] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(!isLocalMode);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!FirebaseAuth) {
      setIsAuthLoading(false);
      return;
    }

    return onAuthStateChanged(FirebaseAuth, (authUser) => {
      setUser(authUser);
      setIsAuthLoading(false);
    });
  }, []);

  const isAuthorized = Boolean(
    isLocalMode ||
      (user && adminEmail && user.email?.toLowerCase() === adminEmail)
  );

  const updateListing = (key: EditablePhotoListingField, value: string) => {
    setListing((prevListing) => ({
      ...prevListing,
      [key]: value,
    }));
  };

  const handleSignIn = async () => {
    if (!FirebaseAuth) {
      return;
    }

    try {
      setMessage("");
      await signInWithPopup(FirebaseAuth, GoogleProvider);
    } catch (error) {
      console.error("Failed to sign in with Google: ", error);
      setMessage("Unable to sign in with Google.");
    }
  };

  const handleSignOut = async () => {
    if (!FirebaseAuth) {
      return;
    }

    try {
      setMessage("");
      await signOut(FirebaseAuth);
    } catch (error) {
      console.error("Failed to sign out: ", error);
      setMessage("Unable to sign out.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthorized) {
      setMessage("You are not authorized to create photo listings.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    const cleanListing = toCleanListing(listing, tagInput);

    if (
      cleanListing.Title.length === 0 ||
      cleanListing.Description.length === 0 ||
      cleanListing.ImageUrl.length === 0
    ) {
      setMessage("Title, description, and image URL are required.");
      setIsSaving(false);
      return;
    }

    try {
      await CreatePhotoListingAsync(cleanListing);
      setListing(getDefaultListing());
      setTagInput("");
      setMessage("Photo listing saved.");
    } catch (error) {
      console.error("Failed to create photo listing: ", error);
      setMessage("Unable to save this listing. Check Firebase rules and config.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!HasFirebaseConfig && !isLocalMode) {
    return <ErrorPage />;
  }

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>Private editor</p>
        <h1>Create Photo Listing</h1>
        <p>
          Sign in with your Google account to create a product-style listing in
          Firestore. Security still depends on the Firestore rules in this repo,
          not this page being hidden.
        </p>
      </section>

      <section className={styles.authPanel}>
        {isLocalMode ? (
          <p>Local mode: photo uploads are enabled without Google sign-in.</p>
        ) : isAuthLoading ? (
          <p>Checking sign-in status...</p>
        ) : user ? (
          <>
            <div>
              <p>Signed in as {user.email}</p>
              <p className={styles.uid}>UID: {user.uid}</p>
            </div>
            <button type="button" onClick={handleSignOut}>
              Sign out
            </button>
          </>
        ) : (
          <button type="button" onClick={handleSignIn}>
            Sign in with Google
          </button>
        )}
      </section>

      {!isLocalMode && user && !isAuthorized ? (
        <p className={styles.status} role="status">
          This account is not authorized. Set REACT_APP_ADMIN_EMAIL for the
          editor UI, then enforce the same owner in Firestore rules by UID.
        </p>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={listing.Title}
            onChange={(event) => updateListing("Title", event.target.value)}
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={listing.Description}
            onChange={(event) =>
              updateListing("Description", event.target.value)
            }
            required
          />
        </label>

        <label>
          Image URL
          <input
            value={listing.ImageUrl}
            onChange={(event) => updateListing("ImageUrl", event.target.value)}
            placeholder="https://drive.google.com/file/d/.../view"
            type="url"
            required
          />
        </label>

        <label>
          Source Link
          <input
            value={listing.Link}
            onChange={(event) => updateListing("Link", event.target.value)}
            placeholder="Optional source or checkout link"
            type="url"
          />
        </label>

        <div className={styles.row}>
          <label>
            Provider
            <input
              value={listing.Provider}
              onChange={(event) =>
                updateListing("Provider", event.target.value)
              }
            />
          </label>

          <label>
            Price / Status
            <input
              value={listing.Price}
              onChange={(event) => updateListing("Price", event.target.value)}
              placeholder="$45 or Available"
            />
          </label>
        </div>

        <div className={styles.row}>
          <label>
            Tags
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="print, city, available"
            />
          </label>

          <label>
            Updated At
            <input
              value={listing.UpdatedAt}
              onChange={(event) =>
                updateListing("UpdatedAt", event.target.value)
              }
              type="date"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!isAuthorized || isSaving || isAuthLoading}
        >
          {isSaving ? "Saving..." : "Create Listing"}
        </button>
      </form>

      {message ? (
        <p className={styles.status} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
