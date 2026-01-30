export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: string;
  prep_time: number; // minutes
  cook_time: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  main_image?: string;
  images: string[];
  is_favorite: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  amount: string;
  unit?: string;
  is_optional: boolean;
}

export interface IngredientOption {
  id: string;
  name: string;
  category?: string;
}

export interface CookingStep {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  image?: string;
}

export interface RecipeTag {
  id: string;
  recipe_id: string;
  name: string;
  color: string;
}

export interface MealRecord {
  id: string;
  user_id: string;
  recipe_id: string;
  date: string; // YYYY-MM-DD
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  rating?: number; // 1-5
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  theme: string;
  preferences: any;
}

// Composite types for frontend usage
export interface RecipeWithDetails extends Recipe {
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  tags: RecipeTag[];
}
