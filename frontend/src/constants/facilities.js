export const AVAILABLE_FACILITIES = [
  { id: 'WIFI', label: 'Wi-Fi', iconName: 'Wifi' },
  { id: 'AC', label: 'Air Conditioning', iconName: 'Wind' },
  { id: 'MEALS', label: 'Meals Included', iconName: 'Utensils' },
  { id: 'LAUNDRY', label: 'Laundry Service', iconName: 'Shirt' },
  { id: 'PARKING', label: 'Vehicle Parking', iconName: 'Car' },
  { id: 'GEYSER', label: 'Water Geyser', iconName: 'Flame' },
  { id: 'RO_WATER', label: 'RO Purified Water', iconName: 'Droplets' },
  { id: 'CCTV', label: 'CCTV Surveillance', iconName: 'Camera' },
  { id: 'DAILY_CLEANING', label: 'Daily Cleaning', iconName: 'Sparkles' },
  { id: 'POWER_BACKUP', label: 'Power Backup', iconName: 'Zap' },
  { id: 'REFRIGERATOR', label: 'Refrigerator', iconName: 'Box' },
  { id: 'GYM', label: 'Gym / Fitness', iconName: 'Dumbbell' }
];

export const FACILITY_MAP = AVAILABLE_FACILITIES.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {});

