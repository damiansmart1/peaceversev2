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
      libraries: ['visualization', 'marker', 'places'],
    });
  }
  return loaderInstance;
};

// Preload Google Maps API - call this early in app lifecycle
export const preloadGoogleMaps = (): Promise<typeof google | null> => {
  // Already loaded successfully
  if (isLoaded && window.google?.maps) {
    return Promise.resolve(window.google);
  }

  // Loading in progress - return existing promise
  if (loadPromise) {
    return loadPromise;
  }

  const loader = initLoader();
  if (!loader) {
    console.warn('Google Maps API key not configured');
    return Promise.resolve(null);
  }

  loadPromise = loader.load()
    .then((google) => {
      isLoaded = true;
      console.log('Google Maps loaded successfully');
      return google;
    })
    .catch((error) => {
      console.error('Google Maps preload failed:', error);
      // Reset state to allow retry
      loadPromise = null;
      throw error;
    });

  return loadPromise;
};

// Check if Google Maps is ready
export const isGoogleMapsReady = (): boolean => {
  return isLoaded && !!window.google?.maps;
};

// Get the Google Maps instance synchronously if available
export const getGoogleMaps = (): typeof google | null => {
  if (isLoaded && window.google?.maps) {
    return window.google;
  }
  // Also check if it was loaded externally
  if (window.google?.maps) {
    isLoaded = true;
    return window.google;
  }
  return null;
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
if (GOOGLE_MAPS_API_KEY && typeof window !== 'undefined') {
  // Use requestIdleCallback for non-blocking preload, fallback to setTimeout
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => preloadGoogleMaps(), { timeout: 2000 });
  } else {
    setTimeout(() => preloadGoogleMaps(), 100);
  }
}
