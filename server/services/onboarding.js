import User from '../models/User.js';
import {
  BUSINESS_TYPES,
  INDUSTRIES,
  ORDER_QUANTITY_RANGES,
  BUDGET_RANGES,
  OPERATING_HOURS,
} from '../constants.js';
import {
  CATEGORY_KEYWORDS,
  FABRIC_TYPE_KEYWORDS,
  COLOR_KEYWORDS,
} from './ai/lexicon.js';

const LABELS = {
  businessType: {
    manufacturer: 'manufacturer',
    designer: 'designer / design studio',
    retailer: 'retailer',
    wholesaler: 'wholesaler / trader',
    brand: 'apparel brand',
    tailoring_house: 'tailoring house',
    exporter: 'exporter',
  },
  industry: {
    fashion: 'fashion / apparel',
    home_textiles: 'home textiles',
    upholstery: 'upholstery & furnishings',
    technical_textiles: 'technical textiles',
    accessories: 'accessories',
    footwear: 'footwear',
    crafts: 'handicrafts / ethnic',
  },
  orderQuantity: {
    under_500: 'under 500 units',
    '500_2000': '500 – 2,000 units',
    '2000_10000': '2,000 – 10,000 units',
    over_10000: '10,000+ units',
  },
  budget: {
    under_50k: 'under $50K / month',
    '50k_200k': '$50K – $200K / month',
    '200k_500k': '$200K – $500K / month',
    over_500k: 'over $500K / month',
  },
  operatingHours: {
    weekdays_9_6: 'Weekdays 9 AM – 6 PM',
    weekdays_10_8: 'Weekdays 10 AM – 8 PM',
    mon_sat_9_7: 'Mon–Sat 9 AM – 7 PM',
    all_week_10_8: 'All week 10 AM – 8 PM',
    custom: 'Custom hours',
  },
};

const findEnum = (text, values) =>
  values.find((v) => text.includes(v.replaceAll('_', ' '))) ||
  values.find((v) => text.includes(v));

const extractNumber = (text) => {
  const m = text.match(/\d[\d,]*/);
  return m ? parseInt(m[0].replace(/,/g, ''), 10) : null;
};

const matchMulti = (text, vocab) =>
  Object.entries(vocab)
    .filter(([, words]) => words.some((w) => text.includes(w)))
    .map(([value]) => value);

const matchEnumLabel = (text, values, labelKey) => {
  const labels = Object.entries(LABELS[labelKey]);
  for (const [value, label] of labels) {
    if (values.includes(value) && text.includes(value.replaceAll('_', ' '))) return value;
    if (values.includes(value) && label.split(' ').slice(0, 2).some((w) => w.length > 3 && text.includes(w.toLowerCase()))) return value;
  }
  return null;
};

const BUYER_STEPS = [
  {
    key: 'businessType',
    question:
      "Great! Let's personalize your marketplace. What type of business are you sourcing for? (e.g. manufacturer, designer, retailer, brand)",
    parse: (text) => matchEnumLabel(text, BUSINESS_TYPES, 'businessType'),
    emptyHint: "Please pick one: manufacturer, designer, retailer, wholesaler, brand, tailoring house, or exporter.",
  },
  {
    key: 'industry',
    question: 'Which industry are you in? (fashion, home textiles, upholstery, technical textiles, accessories...)',
    parse: (text) => matchEnumLabel(text, INDUSTRIES, 'industry'),
    emptyHint: 'Try: fashion, home textiles, upholstery, accessories, or technical textiles.',
  },
  {
    key: 'interests',
    question:
      'Which product categories are you interested in? You can list several — cotton, silk, linen, denim, polyester, blends...',
    parse: (text) => matchMulti(text, CATEGORY_KEYWORDS),
    emptyHint: 'Just say categories like "cotton and silk", or "denim and technical".',
  },
  {
    key: 'fabricTypes',
    question: 'Any preferred fabric types? (chiffon, poplin, satin, velvet, canvas, twill...)',
    parse: (text) => matchMulti(text, FABRIC_TYPE_KEYWORDS),
    emptyHint: 'Examples: chiffon, georgette, satin, velvet, canvas, twill.',
  },
  {
    key: 'typicalOrderQuantity',
    question: "What's a typical order quantity for you? (under 500 / 500-2,000 / 2,000-10,000 / over 10,000 units)",
    parse: (text) => {
      const n = extractNumber(text);
      if (n != null) {
        if (n < 500) return 'under_500';
        if (n <= 2000) return '500_2000';
        if (n <= 10000) return '2000_10000';
        return 'over_10000';
      }
      return findEnum(text, ORDER_QUANTITY_RANGES);
    },
    emptyHint: 'Say a number (e.g. "about 1,500 units") or a range like "500 to 2,000".',
  },
  {
    key: 'budgetRange',
    question: 'What is your approximate monthly sourcing budget? (under $50K / $50–200K / $200–500K / over $500K)',
    parse: (text) => {
      const n = extractNumber(text);
      if (n != null) {
        const v = text.includes('k') ? n : n / 1000;
        if (v < 50) return 'under_50k';
        if (v <= 200) return '50k_200k';
        if (v <= 500) return '200k_500k';
        return 'over_500k';
      }
      return findEnum(text, BUDGET_RANGES);
    },
    emptyHint: 'Try "under 50k", "100k", or "200k to 500k".',
  },
  {
    key: 'colorPreferences',
    question: 'Any preferred colors for your collections? (white, black, navy, beige, prints...)',
    parse: (text) => matchMulti(text, COLOR_KEYWORDS),
    emptyHint: 'Just say colors like "navy and white" or "pastels".',
  },
  {
    key: 'notes',
    question:
      "Perfect, almost done! Any final preferences? For example minimum order flexibility, organic/sustainable materials, or sample requirements. (Type 'skip' to finish)",
    parse: (text) => (/skip|none|nothing|no/i.test(text) ? '' : text),
    emptyHint: 'Type anything, or "skip" to finish.',
    final: true,
  },
];

const SUPPLIER_STEPS = [
  {
    key: 'businessName',
    question: "Welcome! Let's set up your supplier profile. What is your business name?",
    parse: (text) => (/skip/i.test(text) ? '' : text.trim()),
    emptyHint: 'Please type your business or mill name.',
  },
  {
    key: 'businessType',
    question: 'What type of business are you? (mill, weaver, wholesaler/trader, exporter, manufacturer)',
    parse: (text) => text.trim(),
    emptyHint: 'Type your business type, e.g. "textile mill".',
  },
  {
    key: 'contactPhone',
    question: 'What is the best contact phone number for buyers to reach you?',
    parse: (text) => (/skip/i.test(text) ? '' : text.trim()),
    emptyHint: 'Type a phone number, or "skip".',
  },
  {
    key: 'address',
    question: 'What is your business address? (street, city, state, country)',
    parse: (text) => {
      if (/skip/i.test(text)) return { line1: '' };
      const parts = text.split(',').map((s) => s.trim());
      return {
        line1: parts[0] || text,
        city: parts[1] || '',
        state: parts[2] || '',
        country: parts[3] || '',
      };
    },
    emptyHint: 'Format: Street, City, State, Country.',
  },
  {
    key: 'operatingHours',
    question: 'What are your operating hours? (weekdays 9–6, weekdays 10–8, Mon–Sat 9–7, all week 10–8)',
    parse: (text) => matchEnumLabel(text, OPERATING_HOURS, 'operatingHours') || 'custom',
    emptyHint: 'Pick one: weekdays 9–6, weekdays 10–8, Mon–Sat 9–7, all week 10–8.',
  },
  {
    key: 'categories',
    question: 'Which product categories do you supply? List several — cotton, silk, linen, denim, polyester, blends...',
    parse: (text) => matchMulti(text, CATEGORY_KEYWORDS),
    emptyHint: 'Say categories like "cotton and denim".',
  },
  {
    key: 'fabricTypes',
    question: 'What fabric types do you produce or trade? (chiffon, poplin, satin, canvas...)',
    parse: (text) => matchMulti(text, FABRIC_TYPE_KEYWORDS),
    emptyHint: 'Examples: chiffon, poplin, satin, velvet.',
  },
  {
    key: 'moq',
    question: 'What is your minimum order quantity (MOQ)? (e.g. 100 meters)',
    parse: (text) => extractNumber(text) || 100,
    emptyHint: 'Type a number, e.g. "500 meters".',
  },
  {
    key: 'description',
    question:
      "Almost done! Describe your business in a sentence or two — specialities, certifications, production capacity. (Type 'skip' to finish)",
    parse: (text) => (/skip|none/i.test(text) ? '' : text.trim()),
    emptyHint: 'Type a short description, or "skip".',
    final: true,
  },
];

function toReadable(role, data) {
  const keys = Object.keys(data);
  const parts = keys.map((k) => {
    const v = data[k];
    if (!v || (Array.isArray(v) && !v.length)) return null;
    if (Array.isArray(v)) return `${k}: ${v.join(', ')}`;
    if (k === 'address' && typeof v === 'object') {
      const s = [v.line1, v.city, v.state, v.country].filter(Boolean).join(', ');
      return s ? `address: ${s}` : null;
    }
    return `${k}: ${v}`;
  });
  return parts.filter(Boolean).join('\n');
}

function finishMessage(role) {
  if (role === 'supplier') {
    return 'Your supplier profile is all set! You can now add products, manage inventory, and receive orders. Head to your dashboard to get started. 🧵';
  }
  return "That's everything! Your preferences are saved — I'll use them to surface the best fabrics for you. Happy sourcing! 🧵";
}

export async function handleOnboarding({ text, user, context }) {
  const role = user.role;
  const steps = role === 'supplier' ? SUPPLIER_STEPS : BUYER_STEPS;
  const state = context.onboarding || { step: 0, data: {} };

  // First call — kick off the flow.
  if (!context.onboarding) {
    const step = steps[0];
    state.step = 0;
    state.data = {};
    context.onboarding = state;
    return {
      intent: 'onboarding',
      reply: `${step.question}`,
      onboardingStep: 0,
      progress: { current: 1, total: steps.length },
    };
  }

  const current = steps[state.step];
  let value = current.parse(text);
  const answerProvided = value !== null && value !== undefined && value !== '' &&
    !(Array.isArray(value) && value.length === 0) &&
    !(typeof value === 'object' && Object.values(value).every((x) => x === ''));

  if (!answerProvided) {
    return {
      intent: 'onboarding',
      reply: `I didn't catch that. ${current.emptyHint}\n\n${current.question}`,
      onboardingStep: state.step,
      progress: { current: state.step + 1, total: steps.length },
    };
  }

  state.data[current.key] = value;
  state.step += 1;

  if (current.final || state.step >= steps.length) {
    const profile = role === 'supplier' ? 'supplierProfile' : 'buyerProfile';
    await User.findByIdAndUpdate(user._id, {
      onboarded: true,
      [profile]: state.data,
    });
    const summary = toReadable(role, state.data);
    return {
      intent: 'onboarding',
      reply: `${finishMessage(role)}\n\nHere's what I saved:\n${summary}`,
      onboardingComplete: true,
      progress: { current: steps.length, total: steps.length },
      profile: state.data,
    };
  }

  const next = steps[state.step];
  return {
    intent: 'onboarding',
    reply: `Got it — ${current.key.replace(/([A-Z])/g, ' $1').toLowerCase()} saved! ${next.question}`,
    onboardingStep: state.step,
    progress: { current: state.step + 1, total: steps.length },
    lastSaved: { [current.key]: value },
  };
}
