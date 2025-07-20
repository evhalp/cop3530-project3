import React, { useState } from 'react';
import { RouteDisplay } from './components/RouteDisplay';
import { mockRoute } from './mock/mockRoute';
import { RouteResponse } from './types/RouteTypes';

const App = () => {
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Subway Route Finder</h1>
      <button onClick={() => setRouteData(mockRoute)}>Test Route Display</button>
      {routeData && (
        <RouteDisplay
          route={routeData.route}
          estimatedTime={routeData.estimated_time_minutes}
        />
      )}
    </div>
  );
};

export default App;
