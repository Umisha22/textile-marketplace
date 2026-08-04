import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from '../api/client.js';
import { setCurrency } from '../utils/currency.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((data) => {
        setUser(data.user);
        const c = data.user?.buyerProfile?.currency || data.user?.supplierProfile?.currency;
        if (c) setCurrency(c);
      })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      clearToken();
    };
    window.addEventListener('astra:unauthorized', handler);
    return () => window.removeEventListener('astra:unauthorized', handler);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api.post('/auth/login', { email, password }, { auth: false });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const register = useCallback(
    async ({ name, email, password, role }) => {
      const data = await api.post('/auth/register', { name, email, password, role }, { auth: false });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    clearToken();
  }, []);

  const updateUser = useCallback((next) => {
    setUser(next);
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await api.get('/auth/me');
    setUser(data.user);
    const c = data.user?.buyerProfile?.currency || data.user?.supplierProfile?.currency;
    if (c) setCurrency(c);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
