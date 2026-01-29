import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import RecipeList from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import Calendar from './pages/Calendar';
import Statistics from './pages/Statistics';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="recipes" element={<RecipeList />} />
                <Route path="recipes/new" element={<RecipeForm />} />
                <Route path="recipes/:id" element={<RecipeDetail />} />
                <Route path="recipes/:id/edit" element={<RecipeForm />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="statistics" element={<Statistics />} />
                <Route path="search" element={<Search />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
