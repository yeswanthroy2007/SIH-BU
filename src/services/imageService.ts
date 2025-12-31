// Image service for fetching beautiful images from both Pexels and Unsplash
const PEXELS_API_KEY = "9WIvfcdWPVL1MG9JS8J45MW1IVfSx8cZ8BMjk8ghvs8aezKZHmuXhxkC";
const PEXELS_API_URL = "https://api.pexels.com/v1";
const UNSPLASH_ACCESS_KEY = "PDa7fpLGuSdOUmpVJyh6GSyYwdyeImsKsBmP8GgcXBg";
const UNSPLASH_API_URL = "https://api.unsplash.com";

export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    tiny: string;
  };
  alt: string;
  photographer: string;
}

function convertPexelsToUnsplashFormat(photo: PexelsPhoto): UnsplashImage {
  return {
    id: String(photo.id),
    urls: {
      small: photo.src.medium,
      regular: photo.src.large,
      full: photo.src.large2x
    },
    alt_description: photo.alt,
    user: {
      name: photo.photographer
    }
  };
}

export class ImageService {
  private static cache = new Map<string, UnsplashImage[]>();

  static async getPlaceImages(placeName: string, count: number = 3): Promise<UnsplashImage[]> {
    const cacheKey = `place_${placeName}_${count}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Try Pexels first (primary source)
      const pexelsResponse = await fetch(
        `${PEXELS_API_URL}/search?query=${encodeURIComponent(placeName + ' tourist spot india landmark monument historical architecture')}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
        }
      );

      if (pexelsResponse.ok) {
        const pexelsData = await pexelsResponse.json();
        const pexelPhotos = pexelsData.photos || [];
        const images = pexelPhotos.map(convertPexelsToUnsplashFormat);
        this.cache.set(cacheKey, images);
        return images;
      }

      // If Pexels fails, try Unsplash as fallback
      const unsplashResponse = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(placeName + ' tourist spot india landmark heritage')}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
        }
      );

      if (!pexelsResponse.ok) {
        throw new Error(`Failed to fetch images from both APIs`);
      }

      const pexelsData = await pexelsResponse.json();
      const pexelPhotos = pexelsData.photos || [];
      const images = pexelPhotos.map(convertPexelsToUnsplashFormat);
      
      this.cache.set(cacheKey, images);
      return images;
    } catch (error) {
      console.error('Error fetching place images from both Unsplash and Pexels:', error);
      return this.getFallbackImages(count);
    }
  }

  static async getStateImages(stateName: string, count: number = 1): Promise<UnsplashImage[]> {
    const cacheKey = `state_${stateName}_${count}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Try Unsplash first
      const unsplashResponse = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(stateName + ' india tourism landscape')}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (unsplashResponse.ok) {
        const data = await unsplashResponse.json();
        const images = data.results || [];
        this.cache.set(cacheKey, images);
        return images;
      }

      // If Unsplash fails, try Pexels
      const pexelsResponse = await fetch(
        `${PEXELS_API_URL}/search?query=${encodeURIComponent(stateName + ' india tourism landscape')}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
        }
      );

      if (!pexelsResponse.ok) {
        throw new Error(`Failed to fetch images from both APIs`);
      }

      const data = await pexelsResponse.json();
      const pexelPhotos = data.photos || [];
      const images = pexelPhotos.map(convertPexelsToUnsplashFormat);
      
      this.cache.set(cacheKey, images);
      return images;
    } catch (error) {
      console.error('Error fetching state images from both Unsplash and Pexels:', error);
      return this.getFallbackImages(count);
    }
  }

  static async getCategoryImages(category: string, count: number = 1): Promise<UnsplashImage[]> {
    const cacheKey = `category_${category}_${count}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Try Unsplash first
      const unsplashResponse = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(category + ' india tourism')}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (unsplashResponse.ok) {
        const data = await unsplashResponse.json();
        const images = data.results || [];
        this.cache.set(cacheKey, images);
        return images;
      }

      // If Unsplash fails, try Pexels
      const pexelsResponse = await fetch(
        `${PEXELS_API_URL}/search?query=${encodeURIComponent(category + ' india tourism')}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
        }
      );

      if (!pexelsResponse.ok) {
        throw new Error(`Failed to fetch images from both APIs`);
      }

      const data = await pexelsResponse.json();
      const pexelPhotos = data.photos || [];
      const images = pexelPhotos.map(convertPexelsToUnsplashFormat);
      
      this.cache.set(cacheKey, images);
      return images;
    } catch (error) {
      console.error('Error fetching category images from both Unsplash and Pexels:', error);
      return this.getFallbackImages(count);
    }
  }

  static async getBackgroundImages(count: number = 1): Promise<UnsplashImage[]> {
    const cacheKey = `background_${count}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Try Unsplash first
      const unsplashResponse = await fetch(
        `${UNSPLASH_API_URL}/photos/random?query=india tourism landscape beautiful&count=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (unsplashResponse.ok) {
        const images = await unsplashResponse.json();
        const formattedImages = Array.isArray(images) ? images : [images];
        this.cache.set(cacheKey, formattedImages);
        return formattedImages;
      }

      // If Unsplash fails, try Pexels
      const pexelsResponse = await fetch(
        `${PEXELS_API_URL}/curated?per_page=${count}`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
        }
      );

      if (!pexelsResponse.ok) {
        throw new Error(`Failed to fetch images from both APIs`);
      }

      const data = await pexelsResponse.json();
      const pexelPhotos = data.photos || [];
      const images = pexelPhotos.map(convertPexelsToUnsplashFormat);
      
      this.cache.set(cacheKey, images);
      return images;
    } catch (error) {
      console.error('Error fetching background images from both Unsplash and Pexels:', error);
      return this.getFallbackImages(count);
    }
  }

  private static getFallbackImages(count: number): UnsplashImage[] {
    const fallbackImages: UnsplashImage[] = [];
    
    for (let i = 0; i < count; i++) {
      fallbackImages.push({
        id: `fallback_${i}`,
        urls: {
          small: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center`,
          regular: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center`,
          full: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center`
        },
        alt_description: 'Beautiful India landscape',
        user: { name: 'Unsplash' }
      });
    }
    
    return fallbackImages;
  }

  static getOptimizedImageUrl(image: UnsplashImage, size: 'small' | 'regular' | 'full' = 'regular'): string {
    return image.urls[size];
  }
}
