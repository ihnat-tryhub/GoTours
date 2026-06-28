/* eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1Ijoic2xlZXB3YWxrZXJ1YSIsImEiOiJjbTZ6bGx4c2wwNmJsMm1zODJkZ2psdzZ6In0.UVK9IEJQB6oOwcJ-XMKyEw';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/sleepwalkerua/cm71x5xvk01n401s2ezby8e4c', // style URL
    // mapbox://styles/sleepwalkerua/cm71x5xvk01n401s2ezby8e4c
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({ offset: 30 }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
