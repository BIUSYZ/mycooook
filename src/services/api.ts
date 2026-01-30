import { 
  Recipe, 
  RecipeIngredient, 
  CookingStep, 
  RecipeTag, 
  MealRecord, 
  RecipeWithDetails 
} from '../types/definitions.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const api = {
  // Recipes
  async getRecipes(userId: string): Promise<RecipeWithDetails[]> {
    const res = await fetch(`${API_URL}/recipes`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch recipes');
    return res.json();
  },

  async getRecipe(id: string): Promise<RecipeWithDetails | null> {
    const res = await fetch(`${API_URL}/recipes/${id}`, { headers: getHeaders() });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch recipe');
    }
    return res.json();
  },

  async createRecipe(
    recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>,
    ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id'>[],
    steps: Omit<CookingStep, 'id' | 'recipe_id'>[],
    tags: Omit<RecipeTag, 'id' | 'recipe_id'>[]
  ) {
    const payload = { ...recipe, ingredients, steps, tags };
    const res = await fetch(`${API_URL}/recipes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create recipe');
    return res.json();
  },

  async updateRecipe(
    id: string,
    recipe: Partial<Recipe>,
    ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id'>[],
    steps: Omit<CookingStep, 'id' | 'recipe_id'>[],
    tags: Omit<RecipeTag, 'id' | 'recipe_id'>[]
  ) {
    const payload = { ...recipe, ingredients, steps, tags };
    const res = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update recipe');
    return res.json();
  },

  async deleteRecipe(id: string) {
    const res = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete recipe');
  },

  // Storage
  async uploadImage(file: File, userId: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });
    
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url; // Returns relative URL like /uploads/file.jpg
  },

  // Meal Records - Placeholder implementation
  async getMealRecords(userId: string, startDate: string, endDate: string) {
    return [];
  },

  async addMealRecord(record: Omit<MealRecord, 'id' | 'created_at'>) {
    // TODO
  },

  async deleteMealRecord(id: string) {
    // TODO
  }
};
