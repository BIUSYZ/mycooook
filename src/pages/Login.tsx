import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { ChefHat, Utensils } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'chef' | 'foodie' | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setSession, setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setLoading(true);
    setError(null);

    // Hardcoded emails for the two roles
    const email = selectedRole === 'chef' ? 'chef@home.com' : 'foodie@home.com';

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setSession({ access_token: data.token });
      setUser(data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedRole(null);
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-primary flex items-center justify-center">
            <ChefHat className="h-10 w-10 text-orange-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {selectedRole ? (selectedRole === 'chef' ? '大厨请进' : '吃货请进') : '今天你是谁？'}
          </h2>
        </div>

        {!selectedRole ? (
          <div className="grid grid-cols-2 gap-6 mt-8">
            {/* Chef Card */}
            <button
              onClick={() => setSelectedRole('chef')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-orange-500 hover:shadow-md transition-all group"
            >
              <div className="p-4 bg-orange-100 rounded-full mb-4 group-hover:bg-orange-200 transition-colors">
                <ChefHat className="w-10 h-10 text-orange-600" />
              </div>
              <span className="text-lg font-bold text-gray-900">我是大厨</span>
              <span className="text-sm text-gray-500 mt-1">负责做饭</span>
            </button>

            {/* Foodie Card */}
            <button
              onClick={() => setSelectedRole('foodie')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-green-500 hover:shadow-md transition-all group"
            >
              <div className="p-4 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                <Utensils className="w-10 h-10 text-green-600" />
              </div>
              <span className="text-lg font-bold text-gray-900">我是吃货</span>
              <span className="text-sm text-gray-500 mt-1">负责洗碗</span>
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm">
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetSelection}
                className="w-1/3 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                返回
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {loading ? '验证中...' : '进入厨房'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
