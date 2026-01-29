import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { Link } from 'react-router-dom';
import { Plus, Search as SearchIcon } from 'lucide-react';

const RecipeList: React.FC = () => {
  const { user } = useAuth();
  
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes', user?.id],
    queryFn: () => user ? api.getRecipes(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载食谱失败</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的食谱</h1>
          <p className="text-gray-500">管理您的烹饪收藏</p>
        </div>
        <Link
          to="/recipes/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          新建食谱
        </Link>
      </div>

      {/* Filters/Search (Simplified for now) */}
      <div className="relative">
         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
         </div>
         <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="搜索食谱..."
         />
      </div>

      {recipes && recipes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无食谱</h3>
          <p className="mt-1 text-sm text-gray-500">开始创建您的第一个食谱吧。</p>
          <div className="mt-6">
            <Link
              to="/recipes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              新建食谱
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes?.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;
