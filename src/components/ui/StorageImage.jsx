import React, { useState, useEffect } from "react";
import { getPublicUrl } from "../../lib/supabase/storage";
import { Image as ImageIcon, AlertCircle } from "lucide-react";

/**
 * StorageImage component to display images from Supabase Storage
 * @param {string} path - The path of the image in storage (bucket/path) or a full URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS classes for the image
 * @param {string} fallbackSrc - Fallback image URL if loading fails
 * @param {string} bucket - Optional bucket name if path is just the filename (default: 'projects')
 */
const StorageImage = ({
  path,
  alt,
  className = "",
  fallbackSrc = null,
  bucket = "project-files",
  ...props
}) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    // If it's already a full URL, use it directly
    if (path.startsWith("http")) {
      setSrc(path);
      setLoading(false);
      return;
    }

    // Otherwise, get the public URL from Supabase
    try {
      // If path doesn't include bucket, assume it's in the default bucket
      const fullPath = path.includes("/") ? path : `${bucket}/${path}`;
      const url = getPublicUrl(bucket, fullPath);
      if (url) {
        setSrc(url);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching storage image:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [path, bucket]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`}
        {...props}
      >
        <ImageIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />
      </div>
    );
  }

  if (error || !src) {
    if (fallbackSrc) {
      return (
        <img src={fallbackSrc} alt={alt} className={className} {...props} />
      );
    }
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        {...props}
      >
        <ImageIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default StorageImage;
