import React, { createContext, useContext, useEffect, useState } from 'react';

// Simplified user type
export interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  session: { access_token: string } | null; // Keep Supabase-like shape for minimal refactor
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  setUser: () => {},
  setSession: () => {}
});

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      setSession({ access_token: token });
      // Fetch user profile
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Invalid token');
      })
      .then(userData => {
        setUser(userData);
      })
      .catch(() => {
        // Token invalid
        localStorage.removeItem('token');
        setSession(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    localStorage.removeItem('token');
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, setUser, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
