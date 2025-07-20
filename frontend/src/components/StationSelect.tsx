import React from 'react';

interface StationSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export const StationSelect: React.FC<StationSelectProps> = ({ label, value, onChange, options }) => {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select station</option>
        {options.map((station) => (
          <option key={station} value={station}>
            {station}
          </option>
        ))}
      </select>
    </label>
  );
};
