import React, { useState } from 'react';
import { StationSelect } from '../components/StationSelect';
import { RouteDisplay } from '../components/RouteDisplay';
import { MapView } from '../components/MapView';

export default function Home() {
  const stationOptions = ['Times Sq', 'Grand Central', 'Union Sq']; // mock station names
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [route, setRoute] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  const handleGetRoute = () => {
    // Mock logic: pretend backend calculated it
    if (start && end && start !== end) {
      const path = [start, 'Grand Central', end];
      setRoute(path);
      setEstimatedTime(path.length * 4); // 4 min/station as dummy logic
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 bg-gray-100 space-y-4">
        <StationSelect label="Start Station" value={start} onChange={setStart} options={stationOptions} />
        <StationSelect label="End Station" value={end} onChange={setEnd} options={stationOptions} />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleGetRoute}>
          Get Route
        </button>
        <RouteDisplay route={route} estimatedTime={estimatedTime} />
      </div>
      <div className="w-2/3 h-full">
        <MapView />
      </div>
    </div>
  );
}
