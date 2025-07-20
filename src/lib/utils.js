// Converts coordinates into animation-friendly format
 export const transformGeoJsonToRoute = (coordinates) => {
  return coordinates.map(([lng, lat], i) => ({
    latitude: lat,
    longitude: lng,
    timestamp: new Date(Date.now() + i * 1000).toISOString()
  }));
};

// Fetch from OSRM
export const fetchRouteFromOSRM = async (start, end) => {
  const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  return transformGeoJsonToRoute(data.routes[0].geometry.coordinates);
};

export const fetchAllRouteFromOSRM = async (start, end) => {
  const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?alternatives=true&overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  return data.routes.map((route, i) => ({
    name: `Route ${i + 1}`,
    data: transformGeoJsonToRoute(route.geometry.coordinates)
  }));
};
