import React, { useState, useEffect } from 'react';
import { ImageService, UnsplashImage } from '../services/imageService';

interface PageBackgroundProps {
  children: React.ReactNode;
  query?: string;
}

export function PageBackground({ children, query = 'india travel' }: PageBackgroundProps) {
  const [backgroundImage, setBackgroundImage] = useState<UnsplashImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBackgroundImage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const images = await ImageService.getBackgroundImages(1);
        if (images.length > 0) {
          setBackgroundImage(images[0]);
        } else {
          setError('No images found');
        }
      } catch (error) {
        console.error('Error loading background image:', error);
        setError(error instanceof Error ? error.message : 'Failed to load background image');
        // Try fallback
        try {
          const fallback = await ImageService.getPlaceImages('india monuments', 1);
          if (fallback.length > 0) {
            setBackgroundImage(fallback[0]);
            setError(null);
          }
        } catch (fallbackError) {
          console.error('Fallback image loading failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadBackgroundImage();
  }, [query]);

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      {!isLoading && backgroundImage && (
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${ImageService.getOptimizedImageUrl(backgroundImage, 'regular')})`,
            }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}
      {/* Loading or Error State */}
      {(isLoading || error) && (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-900 to-gray-800">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              <div className="animate-pulse">Loading background...</div>
            </div>
          )}
          {error && !backgroundImage && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              <div className="text-sm">{error}</div>
            </div>
          )}
        </div>
      )}
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}