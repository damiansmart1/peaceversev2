/// <reference types="@googlemaps/js-api-loader" />

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options?: any);
    }
    class Marker {
      constructor(options?: any);
      setMap(map: Map | null): void;
    }
    class Circle {
      constructor(options?: any);
      setMap(map: Map | null): void;
    }
    class InfoWindow {
      constructor(options?: any);
      open(map: Map, marker?: Marker): void;
    }
    namespace visualization {
      class HeatmapLayer {
        constructor(options?: any);
        setMap(map: Map | null): void;
      }
    }
  }
}

interface Window {
  google?: typeof google;
}
