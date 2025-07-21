import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { LatLngTuple, map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

interface MapViewProps {
  selectedStations?: string[];
}

const stations: Record<string, LatLngTuple> = {
  "Times Sq": [40.755, -73.987],
  "Grand Central": [40.752, -73.977],
  "Union Sq": [40.735, -73.99]
};

const route: LatLngTuple[] = [
  [40.755, -73.987],
  [40.752, -73.977],
  [40.735, -73.99]
];

// Custom subway icon
const subwayIcon = new L.Icon({
  iconUrl: '/subway-icon.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Bubble overlay component
const AnimatedBubbles: React.FC<{
  selectedStations: string[];
}> = ({ selectedStations }) => {
  const map = useMap();
  return (
    <>
      {Object.entries(stations).map(([name, latlng]) => {
        if (!selectedStations.includes(name)) return null;

        const point = map.latLngToContainerPoint(latlng);
        return (
          <motion.img
            src="/subway-icon.png"
            key={name}
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 140, damping: 10 }}
            style={{
              position: 'absolute',
              top: point.y - 40,
              left: point.x - 20,
              zIndex: 1000,
              pointerEvents: 'none',
              width: 40,
              height: 40,
            }}
          />
        );
      })}
    </>
  );
};

export const MapView: React.FC<MapViewProps> = ({ selectedStations = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer center={[40.75, -73.985]} zoom={13} style={{ height: "100%", width: "100%" }}>

        {/* trying out  Carto Voyager for map view */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />

        {Object.entries(stations).map(([name, coord]) => (
          <Marker
            key={name}
            position={coord}
            icon={subwayIcon}
          >
            <Popup>{name}</Popup>
          </Marker>
        ))}
        <Polyline positions={route} pathOptions={{ color: "blue", weight: 5 }} />
        <AnimatedBubbles selectedStations={selectedStations} />
      </MapContainer>
    </div>
  );
};
