import React from 'react';

interface DateTimePickerProps {
  month: number;
  day: number;
  time: string;
  setMonth: (val: number) => void;
  setDay: (val: number) => void;
  setTime: (val: string) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ month, day, time, setMonth, setDay, setTime }) => {
  return (
    <div>
      <label>
        Month:
        <input type="number" value={month} onChange={(e) => setMonth(Number(e.target.value))} />
      </label>
      <label>
        Day:
        <input type="number" value={day} onChange={(e) => setDay(Number(e.target.value))} />
      </label>
      <label>
        Time:
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </label>
    </div>
  );
};
