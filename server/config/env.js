import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/textile-marketplace';
export const JWT_SECRET =
  process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const HF_TOKEN = process.env.HF_TOKEN || '';
export const HF_MODEL =
  process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';

export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
