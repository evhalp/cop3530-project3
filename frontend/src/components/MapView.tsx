import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const stations = {
  "Times Sq": [40.755, -73.987],
  "Grand Central": [40.752, -73.977],
  "Union Sq": [40.735, -73.99]
};

const route: LatLngTuple[] = [
  [40.755, -73.987],
  [40.752, -73.977],
  [40.735, -73.99]
];

export const MapView: React.FC = () => {
  return (
    <MapContainer center={[40.75, -73.985]} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='Map data © OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Object.entries(stations).map(([name, coord]) => (
        <Marker key={name} position={coord as LatLngTuple}>
          <Popup>{name}</Popup>
        </Marker>
      ))}
      <Polyline positions={route} pathOptions={{ color: "blue", weight: 5 }} />
    </MapContainer>
  );
};
