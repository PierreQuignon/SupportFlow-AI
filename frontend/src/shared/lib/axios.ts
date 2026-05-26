import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Cache backend JWT to avoid exchanging on every request
let cachedBackendToken: string | null = null;
let cachedGoogleToken: string | null = null;

const getBackendToken = async (): Promise<string | null> => {
  const session = await getSession();
  const googleToken = session?.accessToken;

  if (!googleToken) return null;
  if (googleToken === cachedGoogleToken && cachedBackendToken) return cachedBackendToken;

  try {
    const res = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleAccessToken: googleToken }),
    });

    if (res.ok) {
      const data = (await res.json()) as { token: string };
      cachedBackendToken = data.token;
      cachedGoogleToken = googleToken;
      return cachedBackendToken;
    }
  } catch {
    // Backend unavailable
  }

  return null;
};

api.interceptors.request.use(async (config) => {
  const token = await getBackendToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
