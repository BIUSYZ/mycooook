import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Save, ArrowLeft, Upload, ExternalLink } from 'lucide-react';
import { Recipe } from '../types/definitions';

interface RecipeFormData extends Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'images'> {
  ingredients: { name: string; amount: string; unit?: string; is_optional: boolean }[];
  steps: { instruction: string }[];
}

const RecipeForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  const [uploading, setUploading] = useState(false);

  const { data: ingredientOptions } = useQuery({
    queryKey: ['ingredientOptions'],
    queryFn: api.getIngredientOptions
  });

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<RecipeFormData>({
    defaultValues: {
      name: '',
      description: '',
      category: 'Main Course',
      prep_time: 0,
      cook_time: 0,
      servings: 1,
      difficulty: 'medium',
      is_favorite: false,
      notes: '',
      main_image: '',
      ingredients: [
        { name: '', amount: '', is_optional: false },
        { name: '', amount: '', is_optional: false },
        { name: '', amount: '', is_optional: false },
        { name: '', amount: '', is_optional: false }
      ],
      steps: [{ instruction: '' }]
    }
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients'
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps'
  });

  const mainImage = watch('main_image');

  useEffect(() => {
    if (isEditing && id) {
      api.getRecipe(id).then(data => {
        if (data) {
          reset({
            name: data.name,
            description: data.description || '',
            category: data.category,
            prep_time: data.prep_time,
            cook_time: data.cook_time,
            servings: data.servings,
            difficulty: data.difficulty,
            is_favorite: data.is_favorite,
            notes: data.notes || '',
            main_image: data.main_image || '',
            ingredients: data.ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit, is_optional: i.is_optional })),
            steps: data.steps.map(s => ({ instruction: s.instruction }))
          });
        }
      });
    }
  }, [id, isEditing, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    try {
      setUploading(true);
      const file = e.target.files[0];
      const publicUrl = await api.uploadImage(file, user.id);
      setValue('main_image', publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: RecipeFormData) => {
    if (!user) return;

    // Filter empty ingredients
    const validIngredients = data.ingredients.filter(i => i.name.trim() !== '');

    try {
      if (isEditing && id) {
        await api.updateRecipe(
          id,
          {
            name: data.name,
            description: data.description,
            category: data.category,
            prep_time: Number(data.prep_time) || 0,
            cook_time: Number(data.cook_time) || 0,
            servings: Number(data.servings) || 1,
            difficulty: data.difficulty,
            is_favorite: data.is_favorite,
            notes: data.notes,
            main_image: data.main_image,
          },
          validIngredients,
          data.steps.map((s, index) => ({ ...s, step_number: index + 1 })),
          []
        );
      } else {
        await api.createRecipe(
          {
            user_id: user.id,
            name: data.name,
            description: data.description,
            category: data.category,
            prep_time: Number(data.prep_time) || 0,
            cook_time: Number(data.cook_time) || 0,
            servings: Number(data.servings) || 1,
            difficulty: data.difficulty,
            is_favorite: data.is_favorite,
            notes: data.notes,
            main_image: data.main_image,
            images: []
          },
          validIngredients,
          data.steps.map((s, index) => ({ ...s, step_number: index + 1 })),
          []
        );
      }
      navigate('/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-6 flex items-center">
         <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-gray-100">
             <ArrowLeft className="w-5 h-5 text-gray-600" />
         </button>
         <h1 className="text-2xl font-bold text-gray-900">{isEditing ? '编辑食谱' : '新建食谱'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Image & Basic Info */}
            <div className="space-y-6 md:col-span-1">
                {/* 1. Cover Image */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">1. 封面</h2>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      {mainImage ? (
                        <div className="relative w-full h-48">
                          <img src={mainImage} alt="Recipe" className="w-full h-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setValue('main_image', '')}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center py-8">
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">{uploading ? '上传中...' : '点击上传图片'}</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                      )}
                    </div>
                </div>

                {/* 2. Title & Basic Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">2. 基本信息</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">食谱名称</label>
                        <input
                            {...register('name', { required: '请输入食谱名称' })}
                            type="text"
                            placeholder="例如：红烧肉"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-2"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                        <select
                            {...register('category')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                        >
                            <option value="Main Course">主菜</option>
                            <option value="Breakfast">早餐</option>
                            <option value="Lunch">午餐</option>
                            <option value="Dinner">晚餐</option>
                            <option value="Dessert">甜点</option>
                            <option value="Snack">零食</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
                        <select
                           {...register('difficulty')}
                           className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                        >
                           <option value="easy">简单</option>
                           <option value="medium">中等</option>
                           <option value="hard">困难</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Right Column: Ingredients & Steps */}
            <div className="space-y-6 md:col-span-2">
                {/* 3. Ingredients */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-gray-900">3. 食材/调料</h2>
                            <Link to="/ingredients" target="_blank" className="text-xs text-primary flex items-center hover:underline">
                                管理食材库 <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                        </div>
                        <button
                            type="button"
                            onClick={() => appendIngredient({ name: '', amount: '', is_optional: false })}
                            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1" /> 添加
                        </button>
                    </div>
                    
                    <datalist id="ingredient-options">
                        {ingredientOptions?.map((opt: any) => (
                          <option key={opt.id} value={opt.name} />
                        ))}
                    </datalist>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ingredientFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <input
                                        {...register(`ingredients.${index}.name`)}
                                        list="ingredient-options"
                                        placeholder="食材 (如: 鸡蛋)"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border-0 bg-transparent p-1 placeholder-gray-400"
                                    />
                                </div>
                                <div className="w-20 border-l border-gray-200 pl-2">
                                    <input
                                        {...register(`ingredients.${index}.amount`)}
                                        placeholder="用量"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border-0 bg-transparent p-1 placeholder-gray-400 text-right"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(index)}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Steps */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">4. 烹饪步骤</h2>
                        <button
                            type="button"
                            onClick={() => appendStep({ instruction: '' })}
                            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1" /> 添加
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {stepFields.map((field, index) => (
                            <div key={field.id} className="flex gap-3 items-start group">
                                <span className="mt-2 text-xs font-bold text-white bg-primary/80 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <textarea
                                        {...register(`steps.${index}.instruction`, { required: true })}
                                        rows={2}
                                        placeholder={`第 ${index + 1} 步...`}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-3 bg-gray-50 focus:bg-white transition-colors"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Other Info (Description) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                     <label className="block text-sm font-medium text-gray-700 mb-2">备注 / 小贴士</label>
                     <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="写点什么..."
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-3"
                     />
                </div>
            </div>
         </div>

         {/* Fixed Bottom Bar for Mobile / PC */}
         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10 md:sticky md:bottom-4 md:rounded-xl md:border md:shadow-md md:mx-auto md:max-w-6xl">
             <div className="flex items-center justify-between max-w-6xl mx-auto">
                 <div className="text-sm text-gray-500 hidden md:block">
                     {isEditing ? '正在编辑食谱...' : '创建新食谱'}
                 </div>
                 <div className="flex gap-4 w-full md:w-auto">
                     <button
                         type="button"
                         onClick={() => navigate(-1)}
                         className="flex-1 md:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-center"
                     >
                         取消
                     </button>
                     <button
                         type="submit"
                         disabled={isSubmitting || uploading}
                         className="flex-1 md:flex-none px-8 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center shadow-sm shadow-orange-200"
                     >
                         <Save className="w-5 h-5 mr-2" />
                         {isSubmitting ? '保存中...' : '保存食谱'}
                     </button>
                 </div>
             </div>
         </div>

      </form>
    </div>
  );
};

export default RecipeForm;
