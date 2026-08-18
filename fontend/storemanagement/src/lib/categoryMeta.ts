export const CATEGORY_META: Record<string, { sub: string; icon: string; iconBg: string; iconColor: string }> = {
  'Beverages':              { sub: 'Water, tea, coffee & soft drinks', icon: 'local_drink',       iconBg: '#e0f5ed', iconColor: '#00694c' },
  'Snacks & Confectionery': { sub: 'Chips, sweets & sweet treats',     icon: 'cookie',            iconBg: '#fff3d6', iconColor: '#b47b10' },
  'Food':                   { sub: 'Instant foods & canned goods',     icon: 'lunch_dining',      iconBg: '#fef3c7', iconColor: '#92400e' },
  'Personal Care':          { sub: 'Oral, hair & skin care',           icon: 'self_care',         iconBg: '#ede9fe', iconColor: '#4c1d95' },
  'Household Essentials':   { sub: 'Cleaning & storage supplies',      icon: 'cleaning_services', iconBg: '#e0f2fe', iconColor: '#075985' },
};

export const DEFAULT_CATEGORY_META = { sub: '', icon: 'category', iconBg: '#e0f5ed', iconColor: '#00694c' };
