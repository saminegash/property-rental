"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  saveImageMetadata,
  deleteImage,
  setPrimaryImage,
} from "./actions";

type ListingImage = {
  id: string;
  image_url: string;
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
};

type Props = {
  listingId: string;
  existingImages: ListingImage[];
  listingType?: "car" | "property";
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_IMAGES = 5;
const MAX_IMAGES = 10;

export default function ImageUploadForm({
  listingId,
  existingImages,
  listingType = "car",
}: Props) {
  const [images, setImages] = useState<ListingImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setSuccess(null);

    // Check max images limit
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed. You have ${images.length} already.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate all files before uploading
    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a supported format. Use JPEG, PNG, or WebP.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" exceeds the 5 MB size limit.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    setUploading(true);
    const supabase = createClient();
    const newImages: ListingImage[] = [];

    for (const file of Array.from(files)) {
      // Generate unique filename: listingId/timestamp-random.ext
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const storagePath = `${listingId}/${fileName}`;

      // Upload to Supabase Storage (RLS enforces ownership via path)
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError(`Failed to upload "${file.name}": ${uploadError.message}`);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(storagePath);

      // Save metadata to listing_images table (server action)
      const isPrimary = images.length === 0 && newImages.length === 0;
      const sortOrder = images.length + newImages.length;

      const result = await saveImageMetadata({
        listingId,
        imageUrl: urlData.publicUrl,
        storagePath,
        isPrimary,
        sortOrder,
      });

      if (result.error) {
        setError(result.error);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (result.image) {
        newImages.push(result.image);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setSuccess(`${newImages.length} image${newImages.length > 1 ? "s" : ""} uploaded successfully!`);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSetPrimary(imageId: string) {
    setError(null);
    setSuccess(null);

    const result = await setPrimaryImage({ listingId, imageId });
    if (result.error) {
      setError(result.error);
      return;
    }

    // Update local state
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }))
    );
    setSuccess("Primary image updated!");
  }

  async function handleDelete(imageId: string, storagePath: string) {
    setError(null);
    setSuccess(null);

    const result = await deleteImage({ listingId, imageId, storagePath });
    if (result.error) {
      setError(result.error);
      return;
    }

    setImages((prev) => {
      const remaining = prev.filter((img) => img.id !== imageId);
      // If we deleted the primary and there are still images, make the first one primary
      const deletedWasPrimary = prev.find((img) => img.id === imageId)?.is_primary;
      if (deletedWasPrimary && remaining.length > 0) {
        remaining[0].is_primary = true;
      }
      return remaining;
    });
    setSuccess("Image deleted.");
  }

  return (
    <div
      className="dashboard-card"
      style={{ maxWidth: "640px", margin: "2rem auto 0" }}
    >
      <h2 className="dashboard-title" style={{ fontSize: "1.25rem" }}>
        Listing Photos
      </h2>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Upload {MIN_IMAGES} to {MAX_IMAGES} photos of your {listingType === "property" ? "property" : "vehicle"}. The primary image will
        be shown as the cover photo. JPEG, PNG, or WebP — max 5 MB each.
        <br/><br/>
        <strong>Recommended:</strong> {listingType === "property" ? "Exterior, Living room, Bedroom, Kitchen, Bathroom." : "Front exterior, Back exterior, Side exterior, Interior, Dashboard/Details."}
      </p>

      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {success && (
        <div className="form-success" role="status" style={{ marginBottom: "1rem" }}>
          {success}
        </div>
      )}

      {/* Upload zone */}
      {images.length < MAX_IMAGES && (
        <label className="image-upload-zone" aria-disabled={uploading}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="image-upload-input"
          />
          <div className="image-upload-content">
            <span className="image-upload-icon">📷</span>
            <span className="image-upload-text">
              {uploading
                ? "Uploading..."
                : "Click to upload or drag photos here"}
            </span>
            <span className="image-upload-hint">
              {images.length} of {MIN_IMAGES}–{MAX_IMAGES} photos
              {images.length < MIN_IMAGES && (
                <> — need {MIN_IMAGES - images.length} more</>  
              )}
            </span>
          </div>
        </label>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="image-grid">
          {images.map((img) => (
            <div key={img.id} className="image-card">
              <div className="image-card__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt="Listing photo"
                  className="image-card__img"
                />
                {img.is_primary && (
                  <span className="image-card__badge">Primary</span>
                )}
              </div>
              <div className="image-card__actions">
                {!img.is_primary && (
                  <button
                    type="button"
                    className="image-card__btn"
                    onClick={() => handleSetPrimary(img.id)}
                    title="Set as primary image"
                  >
                    ⭐ Primary
                  </button>
                )}
                <button
                  type="button"
                  className="image-card__btn image-card__btn--delete"
                  onClick={() => handleDelete(img.id, img.storage_path)}
                  title="Delete this image"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
