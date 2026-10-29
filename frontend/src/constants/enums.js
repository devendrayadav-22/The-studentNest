export const Role = {
  STUDENT: 'STUDENT',
  PG_OWNER: 'PG_OWNER',
  MESS_OWNER: 'MESS_OWNER',
  ADMIN: 'ADMIN'
};

export const PgType = {
  PG: 'PG',
  HOSTEL: 'HOSTEL',
  FLAT: 'FLAT'
};

export const Gender = {
  BOYS: 'BOYS',
  GIRLS: 'GIRLS',
  ANY: 'ANY'
};

export const SharingType = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
  TRIPLE: 'TRIPLE'
};

export const FoodType = {
  VEG: 'VEG',
  NONVEG: 'NONVEG',
  BOTH: 'BOTH'
};

export const MealType = {
  BREAKFAST: 'BREAKFAST',
  LUNCH: 'LUNCH',
  DINNER: 'DINNER'
};

export const DayOfWeek = {
  MON: 'MON',
  TUE: 'TUE',
  WED: 'WED',
  THU: 'THU',
  FRI: 'FRI',
  SAT: 'SAT',
  SUN: 'SUN',
  ALL: 'ALL'
};

export const ListingStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export const InquiryStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED'
};

export const ReportStatus = {
  OPEN: 'OPEN',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED'
};

export const TargetType = {
  PG: 'PG',
  MESS: 'MESS'
};

export const FOOD_TYPE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pure Veg', value: 'VEG', hint: 'includes messes serving both' },
  { label: 'Non-Veg', value: 'NONVEG', hint: 'includes messes serving both' },
  { label: 'Both', value: 'BOTH' }
];

export const MESS_STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Closed', value: 'closed' }
];

export const MESS_SORT_OPTIONS = [
  { value: 'latest_desc', sortBy: 'latest', order: 'desc', label: 'Newest' },
  { value: 'price_asc', sortBy: 'price', order: 'asc', label: 'Price: Low to High' },
  { value: 'distance_asc', sortBy: 'distance', order: 'asc', label: 'Closest to Campus' },
  { value: 'rating_desc', sortBy: 'rating', order: 'desc', label: 'Highest Rated' }
];

export const PG_SORT_OPTIONS = [
  { value: 'latest_desc', sortBy: 'latest', order: 'desc', label: 'Newest Listings' },
  { value: 'rent_asc', sortBy: 'rent', order: 'asc', label: 'Price: Low to High' },
  { value: 'rent_desc', sortBy: 'rent', order: 'desc', label: 'Price: High to Low' },
  { value: 'distance_asc', sortBy: 'distance', order: 'asc', label: 'Closest to IPS Academy' },
  { value: 'rating_desc', sortBy: 'rating', order: 'desc', label: 'Highest Rated' }
];

