import React from 'react';
import { Plus, ChevronRight, TrendingUp, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { RecipeCard } from '../components/recipes/RecipeCard';

const Home: React.FC = () => {
  const { user } = useAuth();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', user?.id],
    queryFn: () => user ? api.getRecipes(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  const recentRecipes = recipes ? recipes.slice(0, 4) : [];
  const weeklyCookedCount = 0; // Placeholder for now, would need meal records query
  const mostCookedCategory = 'N/A'; // Placeholder

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Today's Overview */}
        <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日概览</h2>
          <div className="flex items-center gap-6">
             <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-primary/20">
                <span className="text-2xl font-bold text-primary">0%</span>
             </div>
             <div className="flex-1 space-y-4">
                <p className="text-gray-600">今日暂无膳食记录。</p>
                <Link to="/calendar" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80">
                   查看日历 <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
             </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
           <h2 className="text-lg font-semibold text-gray-900 mb-4">本周统计</h2>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                 <div className="flex items-center gap-2 mb-2">
                    <ChefHat className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">已烹饪</span>
                 </div>
                 <p className="text-2xl font-bold text-orange-700">{weeklyCookedCount}</p>
                 <p className="text-xs text-orange-600">本周膳食</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                 <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">最爱</span>
                 </div>
                 <p className="text-xl font-bold text-blue-700">{mostCookedCategory}</p>
                 <p className="text-xs text-blue-600">烹饪最多</p>
              </div>
           </div>
        </div>
      </div>

      {/* Recent Recipes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近食谱</h2>
          <Link to="/recipes" className="text-sm font-medium text-primary hover:text-primary/80">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Add New Card */}
           <Link to="/recipes/new" className="flex flex-col items-center justify-center h-full min-h-[280px] rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-orange-50/50 transition-colors group">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                 <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-900">创建新食谱</span>
           </Link>

           {isLoading ? (
             <div>Loading...</div>
           ) : (
             recentRecipes.map(recipe => (
               <RecipeCard key={recipe.id} recipe={recipe} />
             ))
           )}
        </div>
      </div>
    </div>
  );
};

export default Home;
