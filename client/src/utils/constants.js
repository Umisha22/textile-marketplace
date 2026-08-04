export const CATEGORY_LABELS = {
  cotton: 'Cotton',
  silk: 'Silk',
  linen: 'Linen',
  wool: 'Wool',
  denim: 'Denim',
  polyester: 'Polyester',
  viscose: 'Viscose',
  blends: 'Blends',
  lace: 'Lace',
  embroidery: 'Embroidery',
  technical: 'Technical',
};

export const FABRIC_TYPE_LABELS = {
  woven: 'Woven',
  knit: 'Knit',
  chiffon: 'Chiffon',
  georgette: 'Georgette',
  satin: 'Satin',
  organza: 'Organza',
  jacquard: 'Jacquard',
  poplin: 'Poplin',
  muslin: 'Muslin',
  canvas: 'Canvas',
  twill: 'Twill',
  velvet: 'Velvet',
  crepe: 'Crepe',
  broadcloth: 'Broadcloth',
  taffeta: 'Taffeta',
};

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready_for_dispatch', label: 'Ready for Dispatch' },
  { value: 'completed', label: 'Completed' },
];

export const ORDER_STATUS_LABEL = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, s.label])
);

export const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  accepted: 'bg-sky-100 text-sky-800 ring-sky-200',
  preparing: 'bg-violet-100 text-violet-800 ring-violet-200',
  ready_for_dispatch: 'bg-brand-100 text-brand-800 ring-brand-200',
  completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
};

export const BUSINESS_TYPE_LABELS = {
  manufacturer: 'Manufacturer',
  designer: 'Designer / Studio',
  retailer: 'Retailer',
  wholesaler: 'Wholesaler / Trader',
  brand: 'Apparel Brand',
  tailoring_house: 'Tailoring House',
  exporter: 'Exporter',
};

export const INDUSTRY_LABELS = {
  fashion: 'Fashion / Apparel',
  home_textiles: 'Home Textiles',
  upholstery: 'Upholstery',
  technical_textiles: 'Technical Textiles',
  accessories: 'Accessories',
  footwear: 'Footwear',
  crafts: 'Handicrafts',
};

export const ORDER_QTY_LABELS = {
  under_500: 'Under 500 units',
  '500_2000': '500 – 2,000 units',
  '2000_10000': '2,000 – 10,000 units',
  over_10000: '10,000+ units',
};

export const BUDGET_LABELS = {
  under_50k: 'Under $50K',
  '50k_200k': '$50K – $200K',
  '200k_500k': '$200K – $500K',
  over_500k: 'Over $500K',
};

export const HOURS_LABELS = {
  weekdays_9_6: 'Weekdays 9 AM – 6 PM',
  weekdays_10_8: 'Weekdays 10 AM – 8 PM',
  mon_sat_9_7: 'Mon–Sat 9 AM – 7 PM',
  all_week_10_8: 'All week 10 AM – 8 PM',
  custom: 'Custom hours',
};
