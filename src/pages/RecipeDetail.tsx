import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { RecipeWithDetails } from '../types/definitions';
import { Clock, Users, ChefHat, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

const RecipeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
       api.getRecipe(id).then(data => {
          setRecipe(data);
          setLoading(false);
       });
    }
  }, [id]);

  const handleDelete = async () => {
     if (window.confirm('确定要删除这个食谱吗？')) {
         if (id) {
             await api.deleteRecipe(id);
             navigate('/recipes');
         }
     }
  };

  if (loading) return <div>加载中...</div>;
  if (!recipe) return <div>未找到食谱</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
       {/* Header */}
       <div className="flex items-center justify-between">
          <button onClick={() => navigate('/recipes')} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
             <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex space-x-2">
             <Link to={`/recipes/${recipe.id}/edit`} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                <Edit2 className="w-5 h-5" />
             </Link>
             <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-50 text-red-500">
                <Trash2 className="w-5 h-5" />
             </button>
          </div>
       </div>

       {/* Hero Section */}
       <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-gray-200">
          {recipe.main_image ? (
             <img src={recipe.main_image} alt={recipe.name} className="w-full h-full object-cover" />
          ) : (
             <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                暂无图片
             </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
             <div className="text-white">
                <span className={clsx("inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 capitalize bg-primary text-white")}>
                   {recipe.category}
                </span>
                <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
                <p className="text-white/90 max-w-2xl">{recipe.description}</p>
             </div>
          </div>
       </div>

       {/* Meta Data */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <Clock className="w-6 h-6 text-primary mb-2" />
             <span className="text-sm text-gray-500">总时长</span>
             <span className="font-bold text-gray-900">{recipe.prep_time + recipe.cook_time} 分钟</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <Users className="w-6 h-6 text-primary mb-2" />
             <span className="text-sm text-gray-500">份量</span>
             <span className="font-bold text-gray-900">{recipe.servings} 人</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <ChefHat className="w-6 h-6 text-primary mb-2" />
             <span className="text-sm text-gray-500">难度</span>
             <span className="font-bold text-gray-900 capitalize">{recipe.difficulty}</span>
          </div>
       </div>

       <div className="grid md:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="md:col-span-1 space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">食材</h3>
                <ul className="space-y-3">
                   {recipe.ingredients.map((ingredient) => (
                      <li key={ingredient.id} className="flex items-start text-sm">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0" />
                         <span className="flex-1 text-gray-700">
                            <span className="font-medium text-gray-900">{ingredient.amount} {ingredient.unit}</span> {ingredient.name}
                            {ingredient.is_optional && <span className="text-gray-400 text-xs ml-1">(可选)</span>}
                         </span>
                      </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* Steps */}
          <div className="md:col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">烹饪步骤</h3>
                <div className="space-y-8">
                   {recipe.steps.map((step) => (
                      <div key={step.id} className="flex gap-4">
                         <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {step.step_number}
                         </div>
                         <div className="flex-1 pt-1">
                            <p className="text-gray-700 leading-relaxed">{step.instruction}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default RecipeDetail;
