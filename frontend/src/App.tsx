import React, { useState } from 'react';
import { RouteDisplay } from './components/RouteDisplay';
import { MapView } from './components/MapView';
import { StationCard } from './components/StationCard'; 

const App = () => {
  const stations = ['Times Sq', 'Grand Central', 'Union Sq'];

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [datetime, setDatetime] = useState('');
  const [route, setRoute] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  const handleSwap = () => {
    setStart(end);
    setEnd(start);
  };

  const handleGetRoute = () => {
    if (start && end && start !== end) {
      const path = [start, 'Grand Central', end];
      setRoute(path);
      setEstimatedTime(path.length * 4);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 space-y-4 bg-gray-100 flex flex-col items-center justify-start">
        <h1 className="text-2xl font-bold mb-4">Subway Route Finder</h1>
        <StationCard
          start={start}
          end={end}
          datetime={datetime}
          stationOptions={stations}
          onStartChange={setStart}
          onEndChange={setEnd}
          onSwap={handleSwap}
          onDatetimeChange={setDatetime}
          onSubmit={handleGetRoute}
        />
        {route.length > 0 && (
          <div className="mt-4 w-full">
            <RouteDisplay route={route} estimatedTime={estimatedTime} />
          </div>
        )}
      </div>
      <div className="w-2/3 h-full">
        <MapView />
      </div>
    </div>
  );
};

export default App;
