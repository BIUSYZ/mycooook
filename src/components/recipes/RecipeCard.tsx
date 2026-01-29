import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart } from 'lucide-react';
import { Recipe } from '../../types/definitions';
import { clsx } from 'clsx';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Link to={`/recipes/${recipe.id}`} className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
       {/* Image */}
       <div className="w-full overflow-hidden bg-gray-200 group-hover:opacity-75 h-48">
          {recipe.main_image ? (
            <img
              src={recipe.main_image}
              alt={recipe.name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
             <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
               No Image
             </div>
          )}
       </div>
       {/* Content */}
       <div className="flex flex-1 flex-col p-4">
          <div className="flex justify-between items-start">
             <div>
                <span className={clsx("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize", 
                    recipe.difficulty === 'easy' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                    recipe.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                    'bg-red-50 text-red-700 ring-red-600/20'
                )}>
                    {recipe.difficulty}
                </span>
                <h3 className="mt-2 text-lg font-bold text-gray-900 line-clamp-1">{recipe.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{recipe.category}</p>
             </div>
             {recipe.is_favorite && <Heart className="h-5 w-5 text-red-500 fill-current" />}
          </div>
          <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                  <Clock className="mr-1.5 h-4 w-4" />
                  {recipe.prep_time + recipe.cook_time} min
              </div>
              <div className="flex items-center">
                  <Users className="mr-1.5 h-4 w-4" />
                  {recipe.servings}
              </div>
          </div>
       </div>
    </Link>
  );
};
