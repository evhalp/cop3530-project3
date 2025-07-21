import React from 'react';
import {
  FaMapMarkerAlt,
  FaMapSigns,
  FaExchangeAlt,
  FaSearch,
  FaClock,
} from 'react-icons/fa';

interface StationCardProps {
  start: string;
  end: string;
  datetime: string;
  stationOptions: string[];
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  onSwap: () => void;
  onDatetimeChange: (val: string) => void;
  onSubmit: () => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  start,
  end,
  datetime,
  stationOptions,
  onStartChange,
  onEndChange,
  onSwap,
  onDatetimeChange,
  onSubmit,
}) => {
  return (
    <div className="w-[340px] rounded-2xl bg-white shadow-lg p-5 space-y-5 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 text-center">Subway directions</h2>

      {/* Start */}
      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
        <FaMapMarkerAlt className="text-blue-500 mr-2" />
        <select
          value={start}
          onChange={(e) => onStartChange(e.target.value)}
          className="bg-transparent w-full outline-none text-sm text-gray-700 appearance-none"
        >
          <option value="">Choose starting point</option>
          {stationOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <FaSearch className="text-gray-400 ml-2" />
      </div>

      {/* End */}
      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
        <FaMapSigns className="text-red-500 mr-2" />
        <select
          value={end}
          onChange={(e) => onEndChange(e.target.value)}
          className="bg-transparent w-full outline-none text-sm text-gray-700 appearance-none"
        >
          <option value="">Choose destination</option>
          {stationOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={onSwap}
          className="ml-2 text-gray-500 hover:text-gray-800 transition"
          title="Swap"
        >
          <FaExchangeAlt />
        </button>
      </div>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Time */}
      <div className="flex items-center space-x-2">
        <FaClock className="text-gray-400" />
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => onDatetimeChange(e.target.value)}
          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold text-sm transition"
      >
        🚇 Get Route
      </button>
    </div>
  );
};
