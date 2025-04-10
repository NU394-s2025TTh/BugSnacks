/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/FirebaseVideoPlayer.tsx
'use client';

import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';

// Import your configured storage instance
import { storage } from '@/firebaseConfig'; // Adjust path as needed

interface FirebaseVideoPlayerProps {
  /** The filename (e.g., 'uuid-generated-name.mp4') stored in your BugReport */
  filename: string | null | undefined;
  /** The path prefix in Firebase Storage (e.g., 'BugVideos/') */
  pathPrefix: string;
  /** Optional width for the video player */
  width?: string | number;
  /** Optional height for the video player */
  height?: string | number;
  /** Optional CSS classes for the video element */
  className?: string;
}

// Helper to guess MIME type from filename extension
const getMimeTypeFromFilename = (filename: string): string | undefined => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    case 'ogv':
      return 'video/ogg';
    // Add other video types as needed
    default:
      console.warn(`Unknown video extension: ${extension}`);
      return undefined; // Let the browser try to figure it out
  }
};

function FirebaseVideoPlayer({
  filename,
  pathPrefix,
  width = '480', // Default width
  height = '360', // Default height
  className = 'rounded-lg mx-auto', // Default class
}: FirebaseVideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state if filename changes
    setVideoUrl(null);
    setIsLoading(true);
    setError(null);

    if (!filename) {
      setIsLoading(false);
      // No filename provided, so not an error, just nothing to load
      return;
    }

    const fetchVideoUrl = async () => {
      try {
        // Ensure pathPrefix ends with a slash if needed
        const fullPath = `${pathPrefix.endsWith('/') ? pathPrefix : pathPrefix + '/'}${filename}`;
        const videoRef = ref(storage, fullPath);
        const url = await getDownloadURL(videoRef);
        setVideoUrl(url);
      } catch (err: any) {
        console.error('Error getting video download URL:', err);
        if (err.code === 'storage/object-not-found') {
          setError(`Video file not found at path: ${pathPrefix}${filename}`);
        } else {
          setError('Could not load video.');
        }
        setVideoUrl(null); // Clear URL on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoUrl();
  }, [filename, pathPrefix]); // Re-run effect if filename or pathPrefix changes

  // --- Render Logic ---

  if (isLoading) {
    return <p className="text-center p-4">Loading video...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 p-4">Error: {error}</p>;
  }

  if (!videoUrl) {
    // This covers the case where filename was initially null/undefined or if URL fetch failed silently (shouldn't happen with error state)
    return (
      <p className="text-center text-gray-500 p-4">
        No video attached or video could not be loaded.
      </p>
    );
  }

  // Attempt to get MIME type for the source tag
  const mimeType = filename ? getMimeTypeFromFilename(filename) : undefined;

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      width={width}
      height={height}
      className={className}
      controls
      preload="metadata" // Good practice for videos
    >
      {/* Use the fetched download URL */}
      <source src={videoUrl} type={mimeType} />
      {/* Optional: Add fallback text or track elements */}
      {/* Example track element (ensure the src is correct) */}
      {/* <track
                src="/path/to/your/captions.vtt"
                kind="captions"
                srcLang="en"
                label="English"
            /> */}
      Your browser does not support the video tag.
    </video>
  );
}

interface FirebaseImageViewerProps {
  /** The filename (e.g., 'uuid-generated-name.jpg') stored in your data */
  filename: string | null | undefined;
  /** The path prefix in Firebase Storage (e.g., 'BugAttachments/') */
  pathPrefix: string;
  /** Alt text for the image (important for accessibility) */
  altText?: string;
  /** Optional width for the image */
  width?: string | number;
  /** Optional height for the image */
  height?: string | number;
  /** Optional CSS classes for the image element */
  className?: string;
  /** Optional: Style object for inline styles */
  style?: React.CSSProperties;
}

function FirebaseImageViewer({
  filename,
  pathPrefix,
  altText,
  width, // No default width, let CSS handle typically
  height, // No default height
  className = 'max-w-full h-auto rounded', // Basic default styling
  style,
}: FirebaseImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state if filename changes
    setImageUrl(null);
    setIsLoading(true);
    setError(null);

    if (!filename) {
      setIsLoading(false);
      // No filename provided, so not an error, just nothing to load
      return;
    }

    const fetchImageUrl = async () => {
      try {
        // Ensure pathPrefix ends with a slash if needed
        const fullPath = `${pathPrefix.endsWith('/') ? pathPrefix : pathPrefix + '/'}${filename}`;
        const imageRef = ref(storage, fullPath);
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
      } catch (err: any) {
        console.error('Error getting image download URL:', err);
        if (err.code === 'storage/object-not-found') {
          setError(`Image file not found at path: ${pathPrefix}${filename}`);
        } else {
          setError('Could not load image.');
        }
        setImageUrl(null); // Clear URL on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [filename, pathPrefix]); // Re-run effect if filename or pathPrefix changes

  // --- Render Logic ---

  if (isLoading) {
    return <p className="text-center p-2 text-sm">Loading image...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 p-2 text-sm">Error: {error}</p>;
  }

  if (!imageUrl) {
    // This covers the case where filename was initially null/undefined or if URL fetch failed silently
    // You might choose to render nothing or a specific placeholder here
    return <p className="text-center text-gray-500 p-2 text-sm">Image not available.</p>;
  }

  // Determine effective alt text
  const effectiveAltText =
    altText || `Attachment: ${filename}` || 'Uploaded image content'; // Provide fallbacks

  return (
    <img
      src={imageUrl}
      alt={effectiveAltText}
      width={width}
      height={height}
      className={className}
      style={style}
      loading="lazy" // Good practice for images, especially lists
    />
  );
}

export { FirebaseImageViewer, FirebaseVideoPlayer };
