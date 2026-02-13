export const extractDaysAndNights = (durationStr) => {
  if (!durationStr) return { days: 0, nights: 0 };

  const cleanStr = durationStr.trim().replace(/\s+/g, ' '); // normalize spacing

  const regex = /(\d+)\s*Day[s]?\s*\/\s*(\d+)\s*Night[s]?/i;
  const match = cleanStr.match(regex);

  if (!match) return { days: 0, nights: 0 };

  return {
    days: parseInt(match[1], 10),
    nights: parseInt(match[2], 10),
  };
};
