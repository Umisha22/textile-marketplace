# Textile Marketplace — B2B Fabric Sourcing Platform

A functional prototype of a **B2B Textile Marketplace** connecting buyers (garment manufacturers, designers, brands) and suppliers (fabric mills, traders). Built with the **MERN stack** and an integrated **AI assistant** that powers natural-language search, recommendations, comparison, and AI-guided onboarding.

> Hackathon prototype. Payments, escrow, logistics, and admin dashboards are intentionally out of scope.

---

## ✨ Features

### Buyer experience
- Marketplace landing page, product grid, categories, search, and rich filtering
- Product detail pages (gallery, colors, specs, stock, MOQ, price)
- Shopping cart, simplified checkout, and order confirmation
- Buyer dashboard with order history and order-status tracking
- **AI assistant** (chat + voice): natural-language search, fabric recommendations, product comparison, similar products, and product Q&A — available throughout the journey
- **AI-guided conversational onboarding** to personalize the marketplace

### Supplier experience
- Supplier dashboard with KPIs (total/active products, pending orders, inventory alerts)
- Full inventory management (add / edit / delete products, stock, images, availability)
- Order management with status workflow (pending → accepted → preparing → ready for dispatch → completed)
- Supplier profile management and AI-guided onboarding

### Shared / technical
- JWT authentication with role-based access control (buyer / supplier)
- Shared MongoDB database + well-structured REST API
- Responsive, mobile-friendly UI (React + Tailwind CSS)
- Clean, modular architecture ready to scale

---

## 🏗 Architecture

```
textile-marketplace/
├── client/                  # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── api/             # API client
│       ├── components/      # Reusable UI components
│       ├── context/         # AuthContext, CartContext, ToastContext
│       ├── pages/           # buyer/, supplier/, auth/, assistant/, onboarding/
│       ├── utils/           # helpers, constants
│       └── App.jsx          # routes
├── server/                  # Node.js + Express + Mongoose
│   ├── config/              # db, env
│   ├── middleware/          # auth, role guard, error handler
│   ├── models/              # User, Product, Cart, Order, Conversation
│   ├── controllers/         # route handlers
│   ├── routes/              # REST endpoints
│   ├── services/
│   │   ├── ai/              # intent engine, recommendations, pluggable LLM
│   │   └── ...
│   ├── seed.js              # demo data seeder
│   └── server.js            # app entry
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A MongoDB database — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier is recommended

### 2. Set up MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com
2. Add a database user and allow network access from `0.0.0.0/0`
3. Copy the connection string (looks like `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`)

### 3. Backend
```bash
cd server
npm install
# Create server/.env from server/.env.example and paste your MONGO_URI
cp .env.example .env        # Windows: copy .env.example .env
npm run seed                # seed demo data
npm run dev                 # start API on http://localhost:5000
```

### 4. Frontend
```bash
cd client
npm install
npm run dev                 # start app on http://localhost:5173
```

Open **http://localhost:5173** in a browser (Chrome or Edge recommended for voice input).

### Demo accounts (seeded)
| Role     | Email              | Password |
| -------- | ------------------ | -------- |
| Buyer    | buyer@demo.com     | demo1234 |
| Supplier | supplier@demo.com  | demo1234 |

> **Voice input** uses the browser Web Speech API (Chrome/Edge). For the AI assistant, a smart built-in engine works out of the box; optionally plug in a Hugging Face model (see below).

---

## 🤖 AI Assistant

The assistant runs on a **built-in NLU engine** that understands intents like *search*, *recommend*, *compare*, *similar*, and *product Q&A* against real database data — no API key required. Examples:

- *"Show me lightweight cotton fabrics under $5"*
- *"Recommend silk options for a summer dress collection"*
- *"Compare the denim options"*
- *"What is the MOQ for this linen?"*

### Optional: plug in a Hugging Face LLM
The engine is LLM-agnostic. To enable a real model for free-form replies, set in `server/.env`:

```env
HF_TOKEN=hf_xxxxxxxxx        # free token from https://huggingface.co/settings/tokens
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3
```

When configured, the assistant augments replies with LLM-generated text while still grounding product data in the database.

---

## 🔌 API Overview

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/register` | Register buyer/supplier |
| POST | `/api/auth/login` | Login → JWT |
| GET  | `/api/auth/me` | Current user |
| PUT  | `/api/auth/profile` | Update profile / onboarding |
| GET  | `/api/products` | List/search/filter products |
| GET  | `/api/products/featured` | Featured products |
| GET  | `/api/products/categories` | Category + fabric-type facets |
| GET  | `/api/products/:slug` | Product details |
| GET/POST/PUT/DELETE | `/api/cart...` | Cart management (buyer) |
| POST | `/api/orders` | Place order (buyer) |
| GET  | `/api/orders/mine` | Buyer order history |
| PUT  | `/api/orders/:id/status` | Update order status (supplier) |
| GET  | `/api/supplier/dashboard` | Supplier KPIs |
| GET/POST/PUT/DELETE | `/api/supplier/products` | Inventory management |
| GET  | `/api/supplier/orders` | Incoming orders |
| POST | `/api/ai/chat` | AI assistant (chat/voice) |
| POST | `/api/ai/recommend` | Profile-based recommendations |
| POST | `/api/ai/compare` | Product comparison data |

---

## 🧪 Testing

```bash
cd server && node --check server.js     # syntax sanity check
cd client && npm run build              # production build check
```

---

## 📦 Built With
- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (Atlas)
- **Auth:** JSON Web Tokens (JWT), bcrypt
- **AI:** Built-in NLU engine + optional Hugging Face Inference API + Web Speech API
