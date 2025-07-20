import React from 'react';

interface RouteDisplayProps {
  route: string[];
  estimatedTime: number;
}

export const RouteDisplay: React.FC<RouteDisplayProps> = ({ route, estimatedTime }) => {
  return (
    <div>
      <h2>Route:</h2>
      <ul>
        {route.map((station, i) => (
          <li key={i}>{station}</li>
        ))}
      </ul>
      <p>Estimated time: {estimatedTime} minutes</p>
    </div>
  );
};
