import React, { useState, useEffect } from 'react';
import imageService from '../../services/imageService';
export default function ImageRender({
  src,
  alt = 'Immagine',
  className = '',
  maxHeight = '14rem',
  fallback = null,
}) {
  const [resolvedSrc, setResolvedSrc] = useState(null);

  useEffect(() => {
    if (!src) return;

    if (src.startsWith('imageId:')) {
      // estrai l'ID e recupera l'immagine dal servizio
      const imageId = src.replace('imageId:', '');
      imageService.getImageById(imageId).then(img => {
        if (img) {
          setResolvedSrc(img);
        } else {
          setResolvedSrc(null);
        }
      }).catch(() => setResolvedSrc(null));
    } else if (src.startsWith('http:') || src.startsWith('https:')) {
      // URL esterno
      setResolvedSrc(src);
    } else {
      // fallback generico
      setResolvedSrc(null);
    }
  }, [src]);

  if (!resolvedSrc) return fallback;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={`mb-4 rounded-xl shadow-lg object-contain border border-indigo-200 ${className}`}
      style={{ maxHeight }}
      loading="lazy"
    />
  );
}
