import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Plus } from 'lucide-react';
import { useUIStore, useSearchStore } from '../../store';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useUIStore();
  const { searchQuery, setSearchQuery } = useSearchStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search');
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex relative max-w-md w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full py-2 pl-10 pr-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
            placeholder="搜索食谱、食材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/recipes/new')}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          新建食谱
        </button>
      </div>
    </header>
  );
};
