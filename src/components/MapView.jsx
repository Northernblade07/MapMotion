import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import 'leaflet/dist/leaflet.css';
import { Battery, Clock, Fuel, Gauge, KeySquareIcon, LockKeyhole, MapPin, MousePointer2, Snowflake } from "lucide-react";


const MapFollower = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, map.getZoom());
  }, [position, map]);
  return null;
};

// Bearing calculator
const getBearing = (lat1, lon1, lat2, lon2) => {
  const toRad = deg => deg * Math.PI / 180;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  const brng = Math.atan2(y, x);
  return (brng * 180) / Math.PI;
};

// Rotated icon factory
const getRotatedIcon = (angle) =>
  L.divIcon({
    html: `
      <div style="
        transform: rotate(${angle}deg);
        transform-origin: center;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img 
          src="https://imgs.search.brave.com/SO5bTbD4Q_7wJWeukAb5DMJIPHJ3mZrvyPlYH-KiVzI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZy/ZWVwaWsuY29tLzI1/Ni8xMjY4OS8xMjY4/OTMwMi5wbmc_c2Vt/dD1haXNfaHlicmlk"
          style="width: 100%; height: 100%; display: block;"
        />
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20], // center of the icon
    className: 'leaflet-rotated-icon', // optional: add your custom class
  });



const MapView = ({ routeData, currentIndex ,speed,distance ,}) => {
  const markerRef = useRef(null);
  const currentPos = routeData[currentIndex];
  const nextPos = routeData[currentIndex + 1];

  const fullPath = routeData.map(p => [p.latitude, p.longitude]);
  const remainingPath = routeData.slice(currentIndex).map(p => [p.latitude, p.longitude]);

  // Calculate direction angle
  const angle = useMemo(() => {
    if (!nextPos) return 0;
    return getBearing(
      currentPos.latitude,
      currentPos.longitude,
      nextPos.latitude,
      nextPos.longitude
    );
  }, [currentPos, nextPos]);

  // Animate marker manually
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const targetLatLng = L.latLng(currentPos.latitude, currentPos.longitude);
    const duration = 500;
    const startLatLng = marker.getLatLng();
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(1, elapsed / duration);
      const lat = startLatLng.lat + (targetLatLng.lat - startLatLng.lat) * t;
      const lng = startLatLng.lng + (targetLatLng.lng - startLatLng.lng) * t;
      marker.setLatLng([lat, lng]);

      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [currentPos]);

  return (
    <MapContainer
      center={[currentPos.latitude, currentPos.longitude]}
      zoom={17}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Full path in gray (static) */}
      <Polyline positions={fullPath} color="darkgray" />

      {/* Remaining path in blue */}
      <Polyline positions={remainingPath} color="blue" weight={5} />

      {/* Vehicle marker with rotation */}
      <Marker
        position={[currentPos.latitude, currentPos.longitude]}
        icon={getRotatedIcon(angle)}
        ref={markerRef}
      >
        <Popup >
            <p className="flex text-green-400 bg-amber-50 border p-1 rounded-full items-center gap-2"> <Clock /><strong>Time:</strong> {new Date(currentPos.timestamp).toLocaleTimeString()}</p>
          <div className="text-sm flex flex-col items-center bg-amber-50 px-1 py-2 border border-amber-200 rounded-2xl justify-center">
            <div className="flex flex-col items-center">
                 <MapPin className="text-red-600" />
                 <div className="flex items-center justify-around m-0 gap-4">
            <p className="flex flex-col items-center"><strong>Lat:</strong> {currentPos.latitude.toFixed(6)}</p>
            <p className="flex flex-col items-center"><strong>Lng:</strong> {currentPos.longitude.toFixed(6)}</p>
                 </div>
            </div>
            <div className="flex gap-6">

            <p className="flex flex-col items-center justify-center"><MousePointer2 className=" text-purple-400"/><strong>Distance:</strong> {distance}</p>
            <p className="flex flex-col items-center justify-center"><Gauge className="text-blue-400"/><strong>Speed:</strong> {speed}m/s</p>
            </div>
            <div className="flex gap-3 items-center justify-around text-orange-500">
                <KeySquareIcon />
                  <Battery />
                    <Snowflake />
                     <Fuel />
                      <LockKeyhole />
            </div>
          </div>
        </Popup>
      </Marker>

      <MapFollower position={[currentPos.latitude, currentPos.longitude]} />
    </MapContainer>
  );
};

export default MapView;
