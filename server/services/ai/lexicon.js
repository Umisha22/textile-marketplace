// Keyword dictionaries used by the NLU engine to understand buyer language.

export const CATEGORY_KEYWORDS = {
  cotton: ['cotton'],
  silk: ['silk'],
  linen: ['linen', 'flax'],
  wool: ['wool', 'cashmere'],
  denim: ['denim', 'jeans'],
  polyester: ['polyester', 'poly', 'recycled polyester', 'rpet'],
  viscose: ['viscose', 'rayon', 'modal'],
  blends: ['blend', 'poly cotton', 'pc', 'cotton blend', 'silk blend'],
  lace: ['lace'],
  embroidery: ['embroidery', 'embroidered', 'zari'],
  technical: ['technical', 'performance', 'athletic', 'sportswear', 'activewear'],
};

export const FABRIC_TYPE_KEYWORDS = {
  woven: ['woven', 'weave'],
  knit: ['knit', 'knitted', 'jersey'],
  denim: ['denim', 'jeans'],
  blends: ['blend', 'blends', 'pc', 'poly cotton'],
  chiffon: ['chiffon'],
  georgette: ['georgette'],
  satin: ['satin', 'sateen'],
  organza: ['organza'],
  jacquard: ['jacquard', 'brocade'],
  poplin: ['poplin'],
  muslin: ['muslin', 'mulmul', 'mul'],
  canvas: ['canvas', 'duck'],
  twill: ['twill'],
  velvet: ['velvet'],
  crepe: ['crepe'],
  broadcloth: ['broadcloth'],
  taffeta: ['taffeta'],
};

export const COLOR_KEYWORDS = {
  white: ['white', 'ivory', 'off-white', 'cream'],
  black: ['black', 'charcoal'],
  navy: ['navy', 'midnight'],
  blue: ['blue', 'sky blue', 'denim blue'],
  red: ['red', 'crimson', 'scarlet'],
  maroon: ['maroon', 'burgundy', 'wine'],
  green: ['green', 'emerald', 'forest'],
  olive: ['olive', 'khaki'],
  beige: ['beige', 'sand', 'tan', 'taupe'],
  brown: ['brown', 'coffee', 'chocolate'],
  gold: ['gold', 'golden', 'antique gold'],
  silver: ['silver', 'grey', 'gray', 'greyish'],
  pink: ['pink', 'blush', 'rose', 'salmon'],
  purple: ['purple', 'violet', 'lilac', 'lavender'],
  teal: ['teal', 'turquoise', 'aqua'],
  yellow: ['yellow', 'mustard', 'ochre'],
  orange: ['orange', 'terracotta', 'rust'],
  indigo: ['indigo'],
  multicolor: ['multicolor', 'multicolour', 'print', 'printed', 'pattern', 'striped', 'floral'],
};

export const PRICE_HINTS = {
  cheap: ['cheap', 'affordable', 'budget', 'economical', 'low price', 'discount'],
  premium: ['premium', 'luxury', 'high-end', 'high end', 'expensive', 'best quality'],
};

export const QUANTITY_HINTS = {
  small: ['small order', 'sample', 'trial', 'low moq', 'small quantity', 'just starting', 'limited'],
  bulk: ['bulk', 'wholesale', 'large order', 'big quantity', 'reel', 'container'],
};

export const USE_CASE_KEYWORDS = {
  summer: ['summer', 'hot weather', 'warm climate', 'breezy', 'lightweight'],
  winter: ['winter', 'cold', 'warm', 'cozy', 'insulated'],
  dresses: ['dress', 'dresses', 'gown', 'gowns'],
  shirts: ['shirt', 'shirts', 'formals', 'corporate'],
  sarees: ['saree', 'sarees', 'sari', 'ethic'],
  kurtas: ['kurta', 'kurtas', 'ethnic', 'ethnic wear'],
  upholstery: ['upholstery', 'sofa', 'curtain', 'furniture', 'home furnishing'],
  bedding: ['bedding', 'bedsheet', 'duvet', 'pillow', 'bed linen'],
  wedding: ['wedding', 'bridal', 'marriage', 'festive'],
  activewear: ['activewear', 'sportswear', 'gym', 'athletic', 'performance'],
  children: ['kids', 'children', 'baby', 'toddler'],
};

export const INTENT_KEYWORDS = {
  compare: ['compare', 'versus', 'vs', 'difference', 'which is better', 'which one'],
  similar: ['similar', 'like this', 'alternatives', 'other options', 'something like', 'more like'],
  recommend: [
    'recommend', 'suggest', 'suggestion', 'what should', 'best for', 'good for',
    'suitable', 'perfect for', 'looking for', 'need', 'want', 'help me', 'find',
    'show me', 'get me', 'any idea', 'what can i',
  ],
  greeting: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'hola'],
  help: ['help', 'what can you do', 'how do you work', 'capabilities', 'features', 'guide'],
};

export const QA_KEYWORDS = [
  'moq', 'minimum order', 'price', 'cost', 'stock', 'available', 'availability',
  'specification', 'specs', 'spec', 'composition', 'gsm', 'width', 'color',
  'colour', 'colors', 'colour', 'weave', 'finish', 'shipping time', 'delivery',
  'sample', 'what is', 'what are', 'how much', 'how many',
];

export const ALL_CATEGORY_WORDS = Object.values(CATEGORY_KEYWORDS).flat();
export const ALL_FABRIC_WORDS = Object.values(FABRIC_TYPE_KEYWORDS).flat();
export const ALL_COLOR_WORDS = Object.values(COLOR_KEYWORDS).flat();
