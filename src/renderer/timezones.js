// Common timezone data for the UI
const TIMEZONE_DATA = [
  // Popular Cities
  { timezone: 'Europe/London', label: 'London', region: 'Europe' },
  { timezone: 'Europe/Paris', label: 'Paris', region: 'Europe' },
  { timezone: 'Europe/Berlin', label: 'Berlin', region: 'Europe' },
  { timezone: 'Europe/Madrid', label: 'Madrid', region: 'Europe' },
  { timezone: 'Europe/Rome', label: 'Rome', region: 'Europe' },
  { timezone: 'Europe/Amsterdam', label: 'Amsterdam', region: 'Europe' },
  { timezone: 'Europe/Brussels', label: 'Brussels', region: 'Europe' },
  { timezone: 'Europe/Vienna', label: 'Vienna', region: 'Europe' },
  { timezone: 'Europe/Zurich', label: 'Zurich', region: 'Europe' },
  { timezone: 'Europe/Stockholm', label: 'Stockholm', region: 'Europe' },
  { timezone: 'Europe/Oslo', label: 'Oslo', region: 'Europe' },
  { timezone: 'Europe/Copenhagen', label: 'Copenhagen', region: 'Europe' },
  { timezone: 'Europe/Helsinki', label: 'Helsinki', region: 'Europe' },
  { timezone: 'Europe/Warsaw', label: 'Warsaw', region: 'Europe' },
  { timezone: 'Europe/Prague', label: 'Prague', region: 'Europe' },
  { timezone: 'Europe/Budapest', label: 'Budapest', region: 'Europe' },
  { timezone: 'Europe/Athens', label: 'Athens', region: 'Europe' },
  { timezone: 'Europe/Istanbul', label: 'Istanbul', region: 'Europe' },
  { timezone: 'Europe/Moscow', label: 'Moscow', region: 'Europe' },
  { timezone: 'Europe/Dublin', label: 'Dublin', region: 'Europe' },
  { timezone: 'Europe/Lisbon', label: 'Lisbon', region: 'Europe' },
  
  // Americas
  { timezone: 'America/New_York', label: 'New York', region: 'Americas' },
  { timezone: 'America/Los_Angeles', label: 'Los Angeles', region: 'Americas' },
  { timezone: 'America/Chicago', label: 'Chicago', region: 'Americas' },
  { timezone: 'America/Denver', label: 'Denver', region: 'Americas' },
  { timezone: 'America/Phoenix', label: 'Phoenix', region: 'Americas' },
  { timezone: 'America/Toronto', label: 'Toronto', region: 'Americas' },
  { timezone: 'America/Vancouver', label: 'Vancouver', region: 'Americas' },
  { timezone: 'America/Montreal', label: 'Montreal', region: 'Americas' },
  { timezone: 'America/Mexico_City', label: 'Mexico City', region: 'Americas' },
  { timezone: 'America/Sao_Paulo', label: 'São Paulo', region: 'Americas' },
  { timezone: 'America/Buenos_Aires', label: 'Buenos Aires', region: 'Americas' },
  { timezone: 'America/Lima', label: 'Lima', region: 'Americas' },
  { timezone: 'America/Bogota', label: 'Bogotá', region: 'Americas' },
  { timezone: 'America/Santiago', label: 'Santiago', region: 'Americas' },
  { timezone: 'America/Caracas', label: 'Caracas', region: 'Americas' },
  { timezone: 'America/Havana', label: 'Havana', region: 'Americas' },
  { timezone: 'America/Panama', label: 'Panama City', region: 'Americas' },
  { timezone: 'America/Anchorage', label: 'Anchorage', region: 'Americas' },
  { timezone: 'Pacific/Honolulu', label: 'Honolulu', region: 'Americas' },
  
  // Asia
  { timezone: 'Asia/Tokyo', label: 'Tokyo', region: 'Asia' },
  { timezone: 'Asia/Shanghai', label: 'Shanghai', region: 'Asia' },
  { timezone: 'Asia/Hong_Kong', label: 'Hong Kong', region: 'Asia' },
  { timezone: 'Asia/Singapore', label: 'Singapore', region: 'Asia' },
  { timezone: 'Asia/Seoul', label: 'Seoul', region: 'Asia' },
  { timezone: 'Asia/Taipei', label: 'Taipei', region: 'Asia' },
  { timezone: 'Asia/Bangkok', label: 'Bangkok', region: 'Asia' },
  { timezone: 'Asia/Jakarta', label: 'Jakarta', region: 'Asia' },
  { timezone: 'Asia/Manila', label: 'Manila', region: 'Asia' },
  { timezone: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur', region: 'Asia' },
  { timezone: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City', region: 'Asia' },
  { timezone: 'Asia/Dubai', label: 'Dubai', region: 'Asia' },
  { timezone: 'Asia/Kolkata', label: 'Mumbai', region: 'Asia' },
  { timezone: 'Asia/Kolkata', label: 'New Delhi', region: 'Asia' },
  { timezone: 'Asia/Karachi', label: 'Karachi', region: 'Asia' },
  { timezone: 'Asia/Dhaka', label: 'Dhaka', region: 'Asia' },
  { timezone: 'Asia/Riyadh', label: 'Riyadh', region: 'Asia' },
  { timezone: 'Asia/Tehran', label: 'Tehran', region: 'Asia' },
  { timezone: 'Asia/Jerusalem', label: 'Jerusalem', region: 'Asia' },
  { timezone: 'Asia/Beirut', label: 'Beirut', region: 'Asia' },
  { timezone: 'Asia/Almaty', label: 'Almaty', region: 'Asia' },
  
  // Africa
  { timezone: 'Africa/Cairo', label: 'Cairo', region: 'Africa' },
  { timezone: 'Africa/Johannesburg', label: 'Johannesburg', region: 'Africa' },
  { timezone: 'Africa/Lagos', label: 'Lagos', region: 'Africa' },
  { timezone: 'Africa/Nairobi', label: 'Nairobi', region: 'Africa' },
  { timezone: 'Africa/Casablanca', label: 'Casablanca', region: 'Africa' },
  { timezone: 'Africa/Accra', label: 'Accra', region: 'Africa' },
  { timezone: 'Africa/Addis_Ababa', label: 'Addis Ababa', region: 'Africa' },
  { timezone: 'Africa/Algiers', label: 'Algiers', region: 'Africa' },
  { timezone: 'Africa/Tunis', label: 'Tunis', region: 'Africa' },
  
  // Oceania
  { timezone: 'Australia/Sydney', label: 'Sydney', region: 'Oceania' },
  { timezone: 'Australia/Melbourne', label: 'Melbourne', region: 'Oceania' },
  { timezone: 'Australia/Brisbane', label: 'Brisbane', region: 'Oceania' },
  { timezone: 'Australia/Perth', label: 'Perth', region: 'Oceania' },
  { timezone: 'Australia/Adelaide', label: 'Adelaide', region: 'Oceania' },
  { timezone: 'Pacific/Auckland', label: 'Auckland', region: 'Oceania' },
  { timezone: 'Pacific/Fiji', label: 'Fiji', region: 'Oceania' },
  { timezone: 'Pacific/Guam', label: 'Guam', region: 'Oceania' }
];

// Get all unique regions
const REGIONS = [...new Set(TIMEZONE_DATA.map(tz => tz.region))];

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.TIMEZONE_DATA = TIMEZONE_DATA;
  window.REGIONS = REGIONS;
}
