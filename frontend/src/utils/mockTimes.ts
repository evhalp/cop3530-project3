export const getMockTimeEstimate = (route: string[], datetime: string): number => {
  const hour = new Date(datetime).getHours();
  const rushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18);
  const delayFactor = rushHour ? 1.4 : 1.0;
  const baseTime = route.length * 4; // 4 mins per hop
  return Math.round(baseTime * delayFactor);
};
