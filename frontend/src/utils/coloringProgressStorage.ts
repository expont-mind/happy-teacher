import { createClient } from "@/src/utils/supabase/client";

interface ProfileInfo {
  id: string;
  type: "adult" | "child";
  parentId?: string;
}

const BUCKET_NAME = "coloring-progress";

/**
 * Convert a mainImage path to a safe storage file name.
 * e.g. "/fractions/page_1.svg" -> "fractions-page_1.png"
 */
function toStorageFileName(lessonImage: string): string {
  return lessonImage
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .replace(/\.[^.]+$/, ".png");
}

/**
 * Build the full storage path for a profile + lesson.
 * Adults:   {profileId}/{filename}
 * Children: {parentId}/{childId}/{filename}
 */
function buildStoragePath(profile: ProfileInfo, lessonImage: string): string {
  const fileName = toStorageFileName(lessonImage);
  if (profile.type === "child" && profile.parentId) {
    return `${profile.parentId}/${profile.id}/${fileName}`;
  }
  return `${profile.id}/${fileName}`;
}

/**
 * Convert a data URL to a Blob for upload.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const header = parts[0];
  const base64 = parts[1];
  if (!header || !base64) {
    return new Blob([], { type: "image/png" });
  }
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

/**
 * Save coloring progress to Supabase Storage + metadata table.
 */
export async function saveColoringProgress(
  profile: ProfileInfo | null,
  lessonImage: string,
  dataUrl: string,
): Promise<void> {
  if (!profile) return;

  try {
    const supabase = createClient();
    const storagePath = buildStoragePath(profile, lessonImage);
    const blob = dataUrlToBlob(dataUrl);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, blob, {
        contentType: "image/png",
        cacheControl: "0",
        upsert: true,
      });

    if (uploadError) {
      if (
        !uploadError.message?.includes("Bucket not found") &&
        uploadError.message !== "{}"
      ) {
        console.error(
          "Failed to upload coloring progress:",
          uploadError.message,
        );
      }
      return;
    }

    const { error: dbError } = await supabase.from("coloring_progress").upsert(
      {
        profile_id: profile.id,
        profile_type: profile.type,
        parent_id: profile.parentId || null,
        lesson_image: lessonImage,
        storage_path: storagePath,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,lesson_image" },
    );

    if (dbError) {
      if (
        dbError.code === "42P01" ||
        dbError.message?.includes("does not exist")
      ) {
        console.warn(
          "coloring_progress table not found. Run supabase_coloring_progress.sql.",
        );
        return;
      }
      console.error(
        "Failed to save coloring progress metadata:",
        dbError.message,
      );
    }
  } catch (err) {
    console.error("Error saving coloring progress to Supabase:", err);
  }
}

/**
 * Load coloring progress from Supabase Storage.
 * Returns a data URL string or null.
 */
export async function loadColoringProgress(
  profile: ProfileInfo | null,
  lessonImage: string,
): Promise<string | null> {
  if (!profile) return null;

  try {
    const supabase = createClient();
    const storagePath = buildStoragePath(profile, lessonImage);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(storagePath);

    if (error) {
      if (
        !error.message?.includes("Object not found") &&
        !error.message?.includes("not found") &&
        !error.message?.includes("Bucket not found") &&
        error.message !== "{}"
      ) {
        console.error("Error loading from Supabase storage:", error.message);
      }
      return null;
    }

    if (!data) return null;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(data);
    });
  } catch (err) {
    console.error("Error loading coloring progress from Supabase:", err);
    return null;
  }
}

/**
 * Delete coloring progress from Supabase Storage + metadata table.
 */
export async function deleteColoringProgress(
  profile: ProfileInfo | null,
  lessonImage: string,
): Promise<boolean> {
  if (!profile) return false;

  try {
    const supabase = createClient();
    const storagePath = buildStoragePath(profile, lessonImage);

    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (storageError) {
      console.error(
        "Failed to delete coloring progress from storage:",
        storageError.message,
      );
      return false;
    }

    const { error: dbError } = await supabase
      .from("coloring_progress")
      .delete()
      .eq("profile_id", profile.id)
      .eq("lesson_image", lessonImage);

    if (dbError) {
      if (
        dbError.code === "42P01" ||
        dbError.message?.includes("does not exist")
      ) {
        console.warn(
          "coloring_progress table not found. Run supabase_coloring_progress.sql.",
        );
      } else {
        console.error(
          "Failed to delete coloring progress metadata:",
          dbError.message,
        );
      }
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error deleting coloring progress from Supabase:", err);
    return false;
  }
}
