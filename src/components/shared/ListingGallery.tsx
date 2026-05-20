"use client";

import { useState } from "react";

export type GalleryImage = {
  id: string;
  image_url: string;
  is_primary?: boolean;
};

type Props = {
  images: GalleryImage[];
  title: string;
};

export default function ListingGallery({ images, title }: Props) {
  const primaryImage = images.find((img) => img.is_primary) || images[0];
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(primaryImage || null);

  const totalImages = images.length;
  const activeIndex = activeImage ? images.findIndex(img => img.id === activeImage.id) + 1 : 0;

  return (
    <div className="detail-gallery">
      {/* Hero Image */}
      {activeImage ? (
        <div className="detail-gallery__hero" style={{ position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage.image_url}
            alt={`${title} - Image ${activeIndex} of ${totalImages}`}
            className="detail-gallery__hero-img"
          />
          {/* Image Counter Overlay */}
          <div 
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "0.25rem 0.75rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.875rem",
              fontWeight: 500,
              backdropFilter: "blur(4px)",
            }}
          >
            📷 {activeIndex} / {totalImages}
          </div>
        </div>
      ) : (
        <div className="detail-gallery__hero detail-gallery__placeholder">
          <span style={{ fontSize: "3rem", opacity: 0.3 }}>🚗</span>
        </div>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="detail-gallery__thumbs" style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', paddingBottom: '0.5rem' }}>
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img)}
              className={`detail-gallery__thumb ${
                activeImage?.id === img.id ? "detail-gallery__thumb--active" : ""
              }`}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                flexShrink: 0,
              }}
              aria-label={`View image ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt={`Thumbnail ${index + 1}`}
                className="detail-gallery__thumb-img"
                style={{ pointerEvents: "none" }} // prevent dragging issues
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
