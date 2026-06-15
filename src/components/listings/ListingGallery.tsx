"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface GalleryImage {
  image_url: string;
  is_primary: boolean;
}

interface ListingGalleryProps {
  images: GalleryImage[];
  title: string;
}

export default function ListingGallery({ images, title }: ListingGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  // Sort: primary first
  const sorted = [...images].sort((a, b) =>
    a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1
  );

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % sorted.length);
  }, [sorted.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + sorted.length) % sorted.length);
  }, [sorted.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    document.addEventListener("keydown", handler);
    // Lock scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  if (sorted.length === 0) {
    return (
      <div className="gallery__empty">
        <div className="gallery__empty-placeholder">
          <span>No images available</span>
        </div>
      </div>
    );
  }

  const VISIBLE_THUMBS = 5;

  return (
    <>
      {/* Main gallery grid */}
      <div className="gallery">
        {/* Hero image */}
        <div
          className="gallery__hero"
          onClick={() => openLightbox(heroIndex)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") openLightbox(heroIndex);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sorted[heroIndex].image_url}
            alt={`${title} — main image`}
            className="gallery__hero-img"
          />
          <div className="gallery__hero-overlay">
            <Maximize2 className="h-5 w-5" />
          </div>
        </div>

        {/* Thumbnail strip */}
        {sorted.length > 1 && (
          <div className="gallery__thumbs">
            {sorted.slice(0, VISIBLE_THUMBS).map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setHeroIndex(idx)}
                className={`gallery__thumb ${heroIndex === idx ? "gallery__thumb--active" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={`${title} image ${idx + 1}`}
                  className="gallery__thumb-img"
                />
              </button>
            ))}
            {sorted.length > VISIBLE_THUMBS && (
              <button
                type="button"
                onClick={() => openLightbox(VISIBLE_THUMBS)}
                className="gallery__thumb gallery__thumb--more"
              >
                +{sorted.length - VISIBLE_THUMBS}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
        >
          <div
            className="lightbox__content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeLightbox}
              className="lightbox__close"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation */}
            {sorted.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="lightbox__nav lightbox__nav--prev"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="lightbox__nav lightbox__nav--next"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sorted[activeIndex].image_url}
              alt={`${title} image ${activeIndex + 1}`}
              className="lightbox__img"
            />

            {/* Counter + dots */}
            <div className="lightbox__footer">
              <span className="lightbox__counter">
                {activeIndex + 1} of {sorted.length}
              </span>
              <div className="lightbox__dots">
                {sorted.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`lightbox__dot ${idx === activeIndex ? "lightbox__dot--active" : ""}`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
