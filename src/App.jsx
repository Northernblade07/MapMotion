import { useEffect, useState } from 'react';
import MapView from './components/MapView';
import Controllers from './components/Controllers';

// Converts coordinates into animation-friendly format
const transformGeoJsonToRoute = (coordinates) => {
  return coordinates.map(([lng, lat], i) => ({
    latitude: lat,
    longitude: lng,
    timestamp: new Date(Date.now() + i * 5000).toISOString()
  }));
};

// Fetch from OSRM
const fetchRouteFromOSRM = async (start, end) => {
  const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  return transformGeoJsonToRoute(data.routes[0].geometry.coordinates);
};

function App() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [routeData, setRouteData] = useState([]);

  const [origin] = useState({ lat: 17.3850, lng: 78.4867 }); // Hyderabad
  const [destination] = useState({ lat: 17.4933, lng: 78.4035 }); // Some point nearby

  const currentTime = new Date(routeData[index]?.timestamp || Date.now());
  const startTime = new Date(routeData[0]?.timestamp || Date.now());
  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

  useEffect(() => {
    if (!isPlaying || index >= routeData.length - 1) return;
    const delay = new Date(routeData[index + 1].timestamp) - new Date(routeData[index].timestamp);
    const timeout = setTimeout(() => setIndex(prev => prev + 1), delay);
    return () => clearTimeout(timeout);
  }, [isPlaying, index, routeData]);

  useEffect(() => {
    if (index >= routeData.length - 1) {
      setIsPlaying(false);
    }
  }, [index, routeData.length]);

 
  useEffect(() => {
    const fetchInitialRoute = async () => {
      const realRoute = await fetchRouteFromOSRM(origin, destination);
      setRouteData(realRoute);
    };
    fetchInitialRoute();
  }, [origin, destination]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => v * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getTotalDistance = (upToIndex) => {
    let total = 0;
    for (let i = 1; i <= upToIndex && i < routeData.length; i++) {
      total += getDistance(
        routeData[i - 1].latitude,
        routeData[i - 1].longitude,
        routeData[i].latitude,
        routeData[i].longitude
      );
    }
    return total.toFixed(2);
  };

  const getSpeed = (i) => {
    if (i === 0 || i >= routeData.length) return 0;
    const prev = routeData[i - 1];
    const curr = routeData[i];
    const dist = getDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    const time = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000;
    return time > 0 ? (dist / time).toFixed(2) : 0;
  };

  const distanceCovered = getTotalDistance(index);
  const currentSpeed = getSpeed(index);

  const togglePlay = () => setIsPlaying(prev => !prev);
  const handleRestart = () => { setIsPlaying(false); setIndex(0); };
  const handleSeek = (value) => setIndex(value);

  if (!routeData || routeData.length === 0) return <p className="text-center p-4">Loading route...</p>;

  return (
    <div className="relative h-screen w-screen bg-gray-100">

      <Controllers
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        onRestart={handleRestart}
        elapsedTime={elapsedSeconds}
        currentTime={currentTime}
        currentIndex={index}
        maxIndex={routeData.length - 1}
        onSeek={handleSeek}
        speed={currentSpeed}
        distance={distanceCovered}
      />
     
    </div>
  );
}

export default App;
