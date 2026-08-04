import {
  detectIntent,
  extractFilters,
  findProducts,
  recommendProducts,
  similarProducts,
  findByName,
  buildReply,
  toProductBrief,
} from './engine.js';
import { resolveProductReference, answerAboutProduct } from './qa.js';
import { buildComparison, buildComparisonByIds } from './compare.js';
import { augmentWithLLM } from './llm.js';
import { handleOnboarding } from '../onboarding.js';

const GREETING_REPLY = {
  reply:
    "Namaste! I'm Weaver, your AI sourcing assistant. I can search our fabric catalog by natural language, recommend fabrics for your use case, compare products, and answer product questions. What are you sourcing today?",
  suggestions: [
    'Lightweight cotton under $5',
    'Silk for a summer dress line',
    'Compare denim options',
    'What is the MOQ for cotton poplin?',
  ],
};

const HELP_REPLY = {
  reply:
    'Here is what I can do:\n• Natural-language search — "organic cotton knits under $6"\n• Recommendations — "best fabric for bridal wear"\n• Compare — "compare the silk and satin options"\n• Similar products — "more like the jacquard"\n• Product Q&A — "What is the MOQ for velvet?"\n\nJust ask in plain English — or use the mic to speak!',
  suggestions: ['Show me linen', 'Suggest winter fabrics', 'Help me find denim'],
};

async function handleCompare(message, context) {
  const filters = extractFilters(message);
  let products = await findProducts(filters, 6);

  if (products.length < 2 && context.lastProducts?.length) {
    const briefs = [];
    for (const id of context.lastProducts.slice(0, 2)) {
      const p = products.find((x) => String(x.id) === String(id));
      if (p) briefs.push(p);
    }
    products = briefs.length >= 2 ? briefs : products;
  }

  if (products.length < 2) {
    return {
      intent: 'compare',
      reply: 'I need at least two products to compare. Tell me two fabrics or categories, e.g. "compare silk chiffon and satin".',
      suggestions: ['Compare silk and cotton', 'Compare velvet vs crepe'],
    };
  }

  const selected = products.slice(0, 2);
  const compareData = await buildComparisonByIds(selected.map((p) => p.id));
  const finalCompare = compareData || buildComparison(selected);
  return {
    intent: 'compare',
    reply: `Here's a side-by-side comparison of ${finalCompare.products.map((p) => p.name).join(' and ')}:`,
    products: selected,
    compare: finalCompare,
    suggestions: [`Add ${finalCompare.products[0].name} to cart`, 'Recommend for summer dresses'],
  };
}

async function handleSimilar(message, context) {
  const product = await resolveProductReference(message, context);
  if (!product) {
    return {
      intent: 'similar',
      reply: 'Which product would you like similar options for? Try opening a product and saying "show me similar".',
      suggestions: ['Show me lightweight cotton', 'Silk options'],
    };
  }
  const products = await similarProducts(product, 4);
  if (!products.length) {
    return { intent: 'similar', reply: `No direct alternates for ${product.name} right now.`, suggestions: ['Recommend something for summer'] };
  }
  return {
    intent: 'similar',
    reply: `Here are similar options to ${product.name}:`,
    products,
    suggestions: [`Add ${products[0].name} to cart`, 'Compare these options'],
  };
}

async function handleQA(message, context) {
  const product = await resolveProductReference(message, context);
  if (!product) {
    const filters = extractFilters(message);
    const products = await findProducts(filters, 3);
    if (products.length) {
      return {
        intent: 'qa',
        reply: `I found ${products.length} products that may answer your question:\n${products.map((p, i) => `${i + 1}. ${p.name} — $${p.price}/${p.unit}`).join('\n')}\n\nAsk me a specific question like "what is the MOQ?" and I'll dig into the details.`,
        products,
        suggestions: ['What is the MOQ?', 'Is it in stock?'],
      };
    }
    return { intent: 'qa', reply: "I couldn't find the product you're asking about. Try naming it or opening its page.", suggestions: ['Show me cotton shirts fabric'] };
  }
  const answer = answerAboutProduct(message, product);
  return {
    intent: 'qa',
    reply: answer,
    products: [toProductBrief(product)],
    context: { currentProduct: String(product._id) },
    suggestions: ['What is the MOQ?', 'Add to cart', 'Show me similar'],
  };
}

async function handleSearchOrRecommend(message, context, user) {
  const filters = extractFilters(message);
  const hasExplicitFilters =
    filters.categories.length || filters.fabricTypes.length || filters.colors.length ||
    filters.minPrice != null || filters.maxPrice != null;

  let products;
  if (!hasExplicitFilters && user?.buyerProfile) {
    products = await recommendProducts(user.buyerProfile, 6);
  } else {
    products = await findProducts(filters, 6);
  }

  const intent = hasExplicitFilters ? 'search' : 'recommend';
  const built = buildReply(intent, products, filters);
  return { intent, ...built, products, context: { lastProducts: products.map((p) => p.id) } };
}

export async function handleChatMessage({ text, user, role, context = {}, history = [] }) {
  const message = text.trim();

  if (context.mode === 'onboarding') {
    return handleOnboarding({ text: message, user, context });
  }

  let intent = detectIntent(message);
  let result;

  if (intent === 'greeting') result = { intent, ...GREETING_REPLY, products: [] };
  else if (intent === 'help') result = { intent, ...HELP_REPLY, products: [] };
  else if (intent === 'compare') result = await handleCompare(message, context);
  else if (intent === 'similar') result = await handleSimilar(message, context);
  else if (intent === 'qa') result = await handleQA(message, context);
  else result = await handleSearchOrRecommend(message, context, user);

  const llmReply = await augmentWithLLM({
    message,
    products: result.products,
    engineReply: result.reply,
    role,
  });

  if (llmReply) result.reply = llmReply;

  return result;
}

export async function handleRecommend(user) {
  const products = user?.buyerProfile
    ? await recommendProducts(user.buyerProfile, 6)
    : await findProducts({}, 6);
  return { products, reply: buildReply('recommend', products, {}).reply };
}

export async function handleCompareByIds(ids) {
  const compare = await buildComparisonByIds(ids);
  if (!compare) throw new Error('Need at least two valid products to compare.');
  return { compare };
}
