"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Star, GripVertical, ImagePlus } from "lucide-react";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  /** Name for the hidden file inputs — defaults to "images" */
  name?: string;
  /** Maximum number of images allowed */
  maxImages?: number;
  /** Existing images (for edit mode) */
  existingImages?: { id: string; url: string; isPrimary: boolean }[];
  /** Callback when existing image should be deleted */
  onDeleteExisting?: (id: string) => void;
  /** Callback when existing image is set as primary */
  onSetPrimaryExisting?: (id: string) => void;
}

export default function ImageUploader({
  name = "images",
  maxImages = MAX_IMAGES,
  existingImages = [],
  onDeleteExisting,
  onSetPrimaryExisting,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCount = existingImages.length + files.length;

  const validateFiles = useCallback(
    (incoming: File[]): File[] => {
      const valid: File[] = [];
      const remaining = maxImages - totalCount;

      for (const file of incoming) {
        if (valid.length >= remaining) {
          setError(`Maximum ${maxImages} images allowed.`);
          break;
        }
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`"${file.name}" is not a supported image format.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(
            `"${file.name}" exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).`
          );
          continue;
        }
        valid.push(file);
      }
      return valid;
    },
    [maxImages, totalCount]
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      setError(null);
      const valid = validateFiles(incoming);
      if (valid.length === 0) return;

      const newFiles: ImageFile[] = valid.map((file, i) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        isPrimary:
          existingImages.length === 0 && files.length === 0 && i === 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [validateFiles, existingImages.length, files.length]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const removing = prev.find((f) => f.id === id);
      if (removing) URL.revokeObjectURL(removing.preview);

      const next = prev.filter((f) => f.id !== id);
      // If we removed the primary, make the first one primary
      if (removing?.isPrimary && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
    setError(null);
  }, []);

  const setPrimary = useCallback(
    (id: string) => {
      // Unset primary on all existing images if callback is available
      if (existingImages.length > 0 && onSetPrimaryExisting) {
        // Setting primary on a new file — handled by server
      }

      setFiles((prev) =>
        prev.map((f) => ({ ...f, isPrimary: f.id === id }))
      );
    },
    [existingImages.length, onSetPrimaryExisting]
  );

  // Drag handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDragActive(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(Array.from(e.target.files));
        // Reset so the same file can be re-selected
        e.target.value = "";
      }
    },
    [addFiles]
  );

  return (
    <div className="image-uploader">
      <label className="form-label">Images</label>

      {/* Drop zone */}
      {totalCount < maxImages && (
        <div
          className={`image-uploader__dropzone ${dragActive ? "image-uploader__dropzone--active" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            onChange={handleInputChange}
            className="image-uploader__input"
            aria-label="Upload images"
          />
          <div className="image-uploader__dropzone-content">
            <Upload className="image-uploader__dropzone-icon" />
            <p className="image-uploader__dropzone-text">
              Drag &amp; drop images here or click to browse
            </p>
            <p className="image-uploader__dropzone-hint">
              JPG, PNG, WebP • Max {maxImages} images, 5MB each
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <p className="image-uploader__error">{error}</p>}

      {/* Existing images (edit mode) */}
      {existingImages.length > 0 && (
        <div className="image-uploader__section">
          <p className="image-uploader__section-label">Current Images</p>
          <div className="image-uploader__grid">
            {existingImages.map((img) => (
              <div key={img.id} className="image-uploader__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt="Existing listing image"
                  className="image-uploader__preview-img"
                />
                <div className="image-uploader__preview-overlay">
                  {img.isPrimary && (
                    <span className="image-uploader__primary-badge">
                      <Star className="h-3 w-3" /> Primary
                    </span>
                  )}
                  <div className="image-uploader__preview-actions">
                    {!img.isPrimary && onSetPrimaryExisting && (
                      <button
                        type="button"
                        onClick={() => onSetPrimaryExisting(img.id)}
                        className="image-uploader__action-btn"
                        title="Set as primary"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onDeleteExisting && (
                      <button
                        type="button"
                        onClick={() => onDeleteExisting(img.id)}
                        className="image-uploader__action-btn image-uploader__action-btn--danger"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New file previews */}
      {files.length > 0 && (
        <div className="image-uploader__section">
          {existingImages.length > 0 && (
            <p className="image-uploader__section-label">New Images</p>
          )}
          <div className="image-uploader__grid">
            {files.map((f) => (
              <div key={f.id} className="image-uploader__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.preview}
                  alt="Upload preview"
                  className="image-uploader__preview-img"
                />
                <div className="image-uploader__preview-overlay">
                  {f.isPrimary && existingImages.length === 0 && (
                    <span className="image-uploader__primary-badge">
                      <Star className="h-3 w-3" /> Primary
                    </span>
                  )}
                  <div className="image-uploader__preview-actions">
                    {!f.isPrimary && existingImages.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setPrimary(f.id)}
                        className="image-uploader__action-btn"
                        title="Set as primary"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(f.id)}
                      className="image-uploader__action-btn image-uploader__action-btn--danger"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add more button */}
            {totalCount < maxImages && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="image-uploader__add-more"
              >
                <ImagePlus className="h-6 w-6" />
                <span>Add More</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden file inputs for form submission — the actual File objects */}
      {/* We use a DataTransfer trick to attach File objects to hidden inputs */}
      {files.map((f, i) => (
        <HiddenFileInput key={f.id} file={f.file} name={name} index={i} />
      ))}

      {/* Hidden input for primary index */}
      {files.length > 0 && (
        <input
          type="hidden"
          name="primary_image_index"
          value={files.findIndex((f) => f.isPrimary)}
        />
      )}

      <p className="image-uploader__count">
        {totalCount} of {maxImages} images
      </p>
    </div>
  );
}

/**
 * Hidden file input that holds a single File object.
 * Uses the DataTransfer API to programmatically set files on a native input.
 */
function HiddenFileInput({
  file,
  name,
  index,
}: {
  file: File;
  name: string;
  index: number;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      ref.current.files = dt.files;
    }
  }, [file]);

  return (
    <input
      ref={ref}
      type="file"
      name={name}
      style={{ display: "none" }}
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}
