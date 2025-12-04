import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Global state for singleton pattern
let loaderInstance: Loader | null = null;
let loadPromise: Promise<typeof google> | null = null;
let isLoaded = false;

// Initialize loader immediately if key exists
const initLoader = () => {
  if (!loaderInstance && GOOGLE_MAPS_API_KEY) {
    loaderInstance = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['visualization', 'marker'],
    });
  }
  return loaderInstance;
};

// Preload Google Maps API - call this early in app lifecycle
export const preloadGoogleMaps = (): Promise<typeof google | null> => {
  // Already loaded
  if (isLoaded && window.google) {
    return Promise.resolve(window.google);
  }

  // Loading in progress
  if (loadPromise) {
    return loadPromise;
  }

  const loader = initLoader();
  if (!loader) {
    return Promise.resolve(null);
  }

  loadPromise = loader.load()
    .then((google) => {
      isLoaded = true;
      return google;
    })
    .catch((error) => {
      console.error('Google Maps preload failed:', error);
      loadPromise = null; // Allow retry
      return null;
    });

  return loadPromise;
};

// Check if Google Maps is ready
export const isGoogleMapsReady = (): boolean => {
  return isLoaded && !!window.google;
};

// Get the Google Maps instance synchronously if available
export const getGoogleMaps = (): typeof google | null => {
  return isLoaded ? window.google : null;
};

// Hook for components that need Google Maps
export const useGoogleMapsLoader = () => {
  return {
    preload: preloadGoogleMaps,
    isReady: isGoogleMapsReady,
    getGoogle: getGoogleMaps,
  };
};

// Start preloading immediately when this module is imported
if (GOOGLE_MAPS_API_KEY) {
  // Use requestIdleCallback for non-blocking preload, fallback to setTimeout
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => preloadGoogleMaps(), { timeout: 2000 });
    } else {
      setTimeout(() => preloadGoogleMaps(), 100);
    }
  }
}
