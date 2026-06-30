import { useEffect, useMemo, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

import type { TourLocation } from '../types';

type RouteLocation = TourLocation & {
  coordinates: [number, number];
};

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
const mapboxStyle =
  import.meta.env.VITE_MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/outdoors-v12';
const routePinImageId = 'tour-route-pin';

function hasCoordinates(location: TourLocation): location is RouteLocation {
  return (
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    location.coordinates.every((coordinate) => Number.isFinite(coordinate))
  );
}

function createPopupElement(location: RouteLocation): HTMLDivElement {
  const popup = document.createElement('div');
  popup.className = 'map-popup';

  const day = document.createElement('strong');
  day.textContent = location.day ? `Day ${location.day}` : 'Tour stop';

  const description = document.createElement('span');
  description.textContent = location.description ?? location.address ?? 'Route location';

  popup.append(day, description);
  return popup;
}

function createRoutePointCollection(locations: RouteLocation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: locations.map((location) => ({
      type: 'Feature' as const,
      properties: {
        day: location.day ?? '',
        description: location.description ?? location.address ?? 'Route location',
      },
      geometry: {
        type: 'Point' as const,
        coordinates: location.coordinates,
      },
    })),
  };
}

function createRouteLine(locations: RouteLocation[]) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: locations.map((location) => location.coordinates),
    },
  };
}

function createPinDataUrl(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80">
      <path d="M32 76C22.5 61.7 9 49.4 9 30.8C9 17.7 19.3 7 32 7s23 10.7 23 23.8C55 49.4 41.5 61.7 32 76Z" fill="#55c57a" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="32" cy="31" r="10" fill="#ffffff"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function addRoutePinImage(map: import('mapbox-gl').Map): Promise<void> {
  if (map.hasImage(routePinImageId)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    map.loadImage(createPinDataUrl(), (error, image) => {
      if (error || !image) {
        reject(error ?? new Error('Could not load route pin image.'));
        return;
      }

      if (!map.hasImage(routePinImageId)) {
        map.addImage(routePinImageId, image, { pixelRatio: 2 });
      }

      resolve();
    });
  });
}

export function TourMap({ locations }: { locations?: TourLocation[] }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const routeLocations = useMemo(() => locations?.filter(hasCoordinates) ?? [], [locations]);

  useEffect(() => {
    if (!mapContainerRef.current || routeLocations.length === 0 || !mapboxToken) return;

    let isCancelled = false;
    let map: import('mapbox-gl').Map | null = null;
    let popups: import('mapbox-gl').Popup[] = [];

    async function initializeMap() {
      const mapboxModule = await import('mapbox-gl');
      const mapboxgl = mapboxModule.default;

      if (isCancelled || !mapContainerRef.current) return;

      mapboxgl.accessToken = mapboxToken;

      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapboxStyle,
        center: routeLocations[0].coordinates,
        zoom: 4,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

      const bounds = new mapboxgl.LngLatBounds();
      popups = routeLocations.map((location) => {
        bounds.extend(location.coordinates);

        return new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 42,
        })
          .setLngLat(location.coordinates)
          .setDOMContent(createPopupElement(location))
          .addTo(map!);
      });

      map.on('load', async () => {
        if (!map) return;

        await addRoutePinImage(map);

        map.addSource('tour-route-points', {
          type: 'geojson',
          data: createRoutePointCollection(routeLocations),
        });

        if (routeLocations.length > 1) {
          map.addSource('tour-route', {
            type: 'geojson',
            data: createRouteLine(routeLocations),
          });

          map.addLayer({
            id: 'tour-route-line',
            type: 'line',
            source: 'tour-route',
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': '#1f8a5b',
              'line-width': 4,
              'line-opacity': 0.78,
            },
          });
        }

        // Keep route pins inside the Mapbox canvas so they stay locked to the route while zooming.
        map.addLayer({
          id: 'tour-route-pins',
          type: 'symbol',
          source: 'tour-route-points',
          layout: {
            'icon-image': routePinImageId,
            'icon-size': 0.58,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
          },
        });

        if (routeLocations.length > 1) {
          map.fitBounds(bounds, {
            padding: { top: 120, bottom: 90, left: 90, right: 90 },
            maxZoom: 8,
            duration: 900,
          });
          return;
        }

        map.flyTo({
          center: routeLocations[0].coordinates,
          zoom: 8,
          duration: 700,
        });
      });
    }

    void initializeMap();

    return () => {
      isCancelled = true;
      popups.forEach((popup) => popup.remove());
      map?.remove();
    };
  }, [routeLocations]);

  if (routeLocations.length === 0) {
    return null;
  }

  if (!mapboxToken) {
    return (
      <section className="tour-map-section tour-map-empty">
        <div>
          <p className="eyebrow">Route map</p>
          <h2>Mapbox token is missing</h2>
          <p>Add `VITE_MAPBOX_TOKEN` to `client/.env` to render the interactive route map.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="tour-map-section" aria-label="Interactive tour route map">
      <div ref={mapContainerRef} className="tour-map" />
    </section>
  );
}
