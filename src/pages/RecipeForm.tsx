import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Save, ArrowLeft, Upload } from 'lucide-react';
import { Recipe, RecipeIngredient, CookingStep, RecipeTag } from '../types/definitions';

interface RecipeFormData extends Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'images'> {
  ingredients: { name: string; amount: string; unit: string; is_optional: boolean }[];
  steps: { instruction: string }[];
}

const RecipeForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  const [uploading, setUploading] = useState(false);

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<RecipeFormData>({
    defaultValues: {
      name: '',
      description: '',
      category: 'Main Course',
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      difficulty: 'medium',
      is_favorite: false,
      notes: '',
      main_image: '',
      ingredients: [{ name: '', amount: '', unit: '', is_optional: false }],
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

    try {
      if (isEditing && id) {
        await api.updateRecipe(
          id,
          {
            name: data.name,
            description: data.description,
            category: data.category,
            prep_time: Number(data.prep_time),
            cook_time: Number(data.cook_time),
            servings: Number(data.servings),
            difficulty: data.difficulty,
            is_favorite: data.is_favorite,
            notes: data.notes,
            main_image: data.main_image,
          },
          data.ingredients,
          data.steps.map((s, index) => ({ ...s, step_number: index + 1 })),
          [] // tags not implemented in form yet
        );
      } else {
        await api.createRecipe(
          {
            user_id: user.id,
            name: data.name,
            description: data.description,
            category: data.category,
            prep_time: Number(data.prep_time),
            cook_time: Number(data.cook_time),
            servings: Number(data.servings),
            difficulty: data.difficulty,
            is_favorite: data.is_favorite,
            notes: data.notes,
            main_image: data.main_image,
            images: []
          },
          data.ingredients,
          data.steps.map((s, index) => ({ ...s, step_number: index + 1 })),
          [] // tags not implemented in form yet
        );
      }
      navigate('/recipes');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center">
             <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                 <ArrowLeft className="w-5 h-5 text-gray-600" />
             </button>
             <h1 className="text-2xl font-bold text-gray-900">{isEditing ? '编辑食谱' : '新建食谱'}</h1>
         </div>
         <button
             onClick={handleSubmit(onSubmit)}
             disabled={isSubmitting || uploading}
             className="inline-flex items-center px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
         >
             <Save className="w-4 h-4 mr-2" />
             {isSubmitting ? '保存中...' : '保存食谱'}
         </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
         {/* Basic Info */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
             <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
             
             {/* Image Upload */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">食谱封面</label>
                <div className="flex items-center space-x-4">
                  {mainImage && (
                    <img src={mainImage} alt="Recipe" className="h-32 w-32 object-cover rounded-lg border border-gray-200" />
                  )}
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? '上传中...' : '上传图片'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="col-span-2">
                     <label className="block text-sm font-medium text-gray-700">食谱名称</label>
                     <input
                        {...register('name', { required: '请输入食谱名称' })}
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                     />
                     {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700">Category</label>
                     <select
                        {...register('category')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                     >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Snack">Snack</option>
                        <option value="Main Course">Main Course</option>
                     </select>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                     <select
                        {...register('difficulty')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                     >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                     </select>
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700">Prep Time (min)</label>
                     <input
                        {...register('prep_time')}
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700">Cook Time (min)</label>
                     <input
                        {...register('cook_time')}
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                     />
                 </div>

                 <div>
                     <label className="block text-sm font-medium text-gray-700">Servings</label>
                     <input
                        {...register('servings')}
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                     />
                 </div>
                 
                 <div className="col-span-2">
                     <label className="block text-sm font-medium text-gray-700">Description</label>
                     <textarea
                        {...register('description')}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                     />
                 </div>
             </div>
         </div>

         {/* Ingredients */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
             <div className="flex items-center justify-between">
                 <h2 className="text-lg font-semibold text-gray-900">食材</h2>
                 <button
                     type="button"
                     onClick={() => appendIngredient({ name: '', amount: '', unit: '', is_optional: false })}
                     className="text-sm text-primary hover:text-primary/80 font-medium"
                 >
                     + 添加食材
                 </button>
             </div>
             
             <div className="space-y-4">
                 {ingredientFields.map((field, index) => (
                     <div key={field.id} className="flex gap-4 items-start">
                         <div className="flex-1">
                             <input
                                {...register(`ingredients.${index}.name`, { required: true })}
                                placeholder="食材名称"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                             />
                         </div>
                         <div className="w-24">
                             <input
                                {...register(`ingredients.${index}.amount`)}
                                placeholder="数量"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                             />
                         </div>
                         <div className="w-24">
                             <input
                                {...register(`ingredients.${index}.unit`)}
                                placeholder="单位"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                             />
                         </div>
                         <button
                             type="button"
                             onClick={() => removeIngredient(index)}
                             className="p-2 text-gray-400 hover:text-red-500"
                         >
                             <Trash2 className="w-5 h-5" />
                         </button>
                     </div>
                 ))}
             </div>
         </div>

         {/* Steps */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
             <div className="flex items-center justify-between">
                 <h2 className="text-lg font-semibold text-gray-900">烹饪步骤</h2>
                 <button
                     type="button"
                     onClick={() => appendStep({ instruction: '' })}
                     className="text-sm text-primary hover:text-primary/80 font-medium"
                 >
                     + 添加步骤
                 </button>
             </div>
             
             <div className="space-y-4">
                 {stepFields.map((field, index) => (
                     <div key={field.id} className="flex gap-4 items-start">
                         <span className="mt-2 text-sm font-medium text-gray-500 w-6">{index + 1}.</span>
                         <div className="flex-1">
                             <textarea
                                {...register(`steps.${index}.instruction`, { required: true })}
                                rows={2}
                                placeholder="描述此步骤..."
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                             />
                         </div>
                         <button
                             type="button"
                             onClick={() => removeStep(index)}
                             className="p-2 text-gray-400 hover:text-red-500"
                         >
                             <Trash2 className="w-5 h-5" />
                         </button>
                     </div>
                 ))}
             </div>
         </div>
      </form>
    </div>
  );
};

export default RecipeForm;
