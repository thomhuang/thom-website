import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";

import { FirebaseDb } from "../Firebase/FirebaseClient";

const PHOTO_LISTINGS_URL = process.env.REACT_APP_PHOTO_LISTINGS_URL;
const PHOTO_LISTINGS_COLLECTION = "photoListings";

export interface PhotoListing {
  ID: string;
  Title: string;
  Description: string;
  ImageUrl: string;
  Provider?: string;
  Price?: string;
  Tags?: string[];
  UpdatedAt?: string;
  Link?: string;
}

export type NewPhotoListing = Omit<PhotoListing, "ID">;

const sampleListings: PhotoListing[] = [
  {
    ID: "sample-cloud-photo",
    Title: "Sample Cloud Photo",
    Description:
      "Replace this listing by setting REACT_APP_PHOTO_LISTINGS_URL to a public JSON file hosted in Google Drive, S3, Cloudinary, or a similar provider.",
    ImageUrl: "https://placehold.co/900x650?text=Cloud+Photo",
    Provider: "Cloud manifest",
    Price: "Portfolio item",
    Tags: ["sample", "cloud-ready"],
    UpdatedAt: "Draft",
  },
];

const GOOGLE_DRIVE_FILE_PATTERN = /drive\.google\.com\/file\/d\/([^/]+)/;

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
};

const toPhotoListing = (
  data: DocumentData | Partial<PhotoListing>,
  fallbackId: string
): PhotoListing | undefined => {
  if (
    typeof data.Title !== "string" ||
    typeof data.Description !== "string" ||
    typeof data.ImageUrl !== "string" ||
    data.ImageUrl.length === 0
  ) {
    return;
  }

  return {
    ID: typeof data.ID === "string" ? data.ID : fallbackId,
    Title: data.Title,
    Description: data.Description,
    ImageUrl: data.ImageUrl,
    Provider: typeof data.Provider === "string" ? data.Provider : undefined,
    Price: typeof data.Price === "string" ? data.Price : undefined,
    Tags: isStringArray(data.Tags) ? data.Tags : undefined,
    UpdatedAt: typeof data.UpdatedAt === "string" ? data.UpdatedAt : undefined,
    Link: typeof data.Link === "string" ? data.Link : undefined,
  };
};

export const ToPublicPhotoUrl = (url: string): string => {
  const googleDriveFileId = url.match(GOOGLE_DRIVE_FILE_PATTERN)?.[1];

  if (googleDriveFileId) {
    return `https://drive.google.com/uc?export=view&id=${googleDriveFileId}`;
  }

  return url;
};

const getPhotoListingsFromFirestore = async (): Promise<PhotoListing[]> => {
  if (!FirebaseDb) {
    return sampleListings;
  }

  const listingsSnapshot = await getDocs(
    query(
      collection(FirebaseDb, PHOTO_LISTINGS_COLLECTION),
      orderBy("CreatedAt", "desc")
    )
  );

  return listingsSnapshot.docs
    .map((doc) => toPhotoListing(doc.data(), doc.id))
    .filter((listing): listing is PhotoListing => Boolean(listing));
};

export const GetPhotoListingsAsync = async (
  signal?: AbortSignal
): Promise<PhotoListing[]> => {
  if (!PHOTO_LISTINGS_URL) {
    return getPhotoListingsFromFirestore();
  }

  const response = await fetch(PHOTO_LISTINGS_URL, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Photo listings request failed: ${response.status} ${response.statusText}`
    );
  }

  const listings = (await response.json()) as Partial<PhotoListing>[];

  return listings
    .map((listing, index) => toPhotoListing(listing, String(index + 1)))
    .filter((listing): listing is PhotoListing => Boolean(listing));
};

export const CreatePhotoListingAsync = async (
  listing: NewPhotoListing
): Promise<void> => {
  if (!FirebaseDb) {
    throw new Error("Firebase is not configured for photo listing writes");
  }

  await addDoc(collection(FirebaseDb, PHOTO_LISTINGS_COLLECTION), {
    ...listing,
    CreatedAt: serverTimestamp(),
  });
};
