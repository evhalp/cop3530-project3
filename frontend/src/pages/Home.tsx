import React, { useState } from 'react';
import { RouteDisplay } from '../components/RouteDisplay';
import { MapView } from '../components/MapView';
import { getMockTimeEstimate } from '../utils/mockTimes';
import { FaMapMarkerAlt, FaMapSigns, FaExchangeAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { StationCard } from '../components/StationCard';


export default function Home() {
  const stationOptions = ['Times Sq', 'Grand Central', 'Union Sq'];
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [datetime, setDatetime] = useState('');
  const [route, setRoute] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  const handleGetRoute = () => {
    if (start && end && start !== end && datetime) {
      const path = [start, ...(start !== 'Grand Central' && end !== 'Grand Central' ? ['Grand Central'] : []), end];
      setRoute(path);
      const time = getMockTimeEstimate(path, datetime);
      setEstimatedTime(time);
    }
  };

  const handleSwap = () => {
    setStart(end);
    setEnd(start);
  };

  return (
    <div className="relative h-screen w-full bg-gray-50">
      <MapView selectedStations={[start, end]} />

        <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="absolute top-6 left-6 z-[999]"
>
  <StationCard
    start={start}
    end={end}
    datetime={datetime}
    stationOptions={stationOptions}
    onStartChange={setStart}
    onEndChange={setEnd}
    onSwap={handleSwap}
    onDatetimeChange={setDatetime}
    onSubmit={handleGetRoute}
  />
  {route.length > 0 && (
    <div className="mt-4">
      <RouteDisplay route={route} estimatedTime={estimatedTime} />
    </div>
  )}
</motion.div>

    </div>
  );
}
