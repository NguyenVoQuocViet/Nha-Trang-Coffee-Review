// Administrative areas of Nha Trang after the 2025 ward reorganization.
// The city was consolidated into these 4 large areas/wards.
export const NHA_TRANG_AREAS = [
  'Nha Trang',
  'Nam Nha Trang',
  'Bắc Nha Trang',
  'Tây Nha Trang',
] as const;

export type NhaTrangArea = (typeof NHA_TRANG_AREAS)[number];

// Same list prefixed with the "all" option, used by filter bars.
export const DISTRICT_FILTERS = ['Tất cả', ...NHA_TRANG_AREAS];
