import React, { useState } from 'react';
import { StationSelect } from './components/StationSelect';
import { RouteDisplay } from './components/RouteDisplay';
import { MapView } from './components/MapView';

const App = () => {
  const stations = ['Times Sq', 'Grand Central', 'Union Sq'];
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [route, setRoute] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  const handleGetRoute = () => {
    if (start && end && start !== end) {
      const path = [start, 'Grand Central', end];
      setRoute(path);
      setEstimatedTime(path.length * 4);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 space-y-4 bg-gray-100">
        <h1 className="text-xl font-bold">Subway Route Finder</h1>
        <StationSelect label="Start Station" value={start} onChange={setStart} options={stations} />
        <StationSelect label="End Station" value={end} onChange={setEnd} options={stations} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleGetRoute}>
          Get Route
        </button>
        {route.length > 0 && <RouteDisplay route={route} estimatedTime={estimatedTime} />}
      </div>
      <div className="w-2/3 h-full">
        <MapView />
      </div>
    </div>
  );
};

export default App;
