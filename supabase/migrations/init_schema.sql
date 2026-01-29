-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Create tables
create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  category text,
  prep_time integer,
  cook_time integer,
  servings integer,
  difficulty text,
  main_image text,
  images text[] default array[]::text[],
  is_favorite boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade not null,
  name text not null,
  amount text,
  unit text,
  is_optional boolean default false
);

create table cooking_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade not null,
  step_number integer not null,
  instruction text not null,
  image text
);

create table recipe_tags (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade not null,
  name text not null,
  color text
);

create table meal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  recipe_id uuid references recipes(id) on delete set null,
  date date not null,
  meal_type text not null,
  notes text,
  rating integer,
  created_at timestamptz default now()
);

create table user_settings (
  user_id uuid primary key references auth.users on delete cascade,
  theme text default 'light',
  preferences jsonb default '{}'::jsonb
);

-- Enable RLS
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;
alter table cooking_steps enable row level security;
alter table recipe_tags enable row level security;
alter table meal_records enable row level security;
alter table user_settings enable row level security;

-- Create Policies
-- Recipes
create policy "Users can CRUD their own recipes" on recipes
  for all using (auth.uid() = user_id);

-- Recipe Ingredients (inherits access from recipe, but simpler to just check recipe ownership via join or just trust the insertion logic? 
-- Standard way: check recipe ownership. But for simplicity in this migration, we can assume if you can edit the recipe, you can edit ingredients.
-- Actually, RLS on child tables is tricky. Let's just add user_id to child tables? No, that's redundant.
-- We can use a `using` clause with a subquery.
create policy "Users can CRUD their own recipe ingredients" on recipe_ingredients
  for all using (
    exists (
      select 1 from recipes
      where recipes.id = recipe_ingredients.recipe_id
      and recipes.user_id = auth.uid()
    )
  );

create policy "Users can CRUD their own cooking steps" on cooking_steps
  for all using (
    exists (
      select 1 from recipes
      where recipes.id = cooking_steps.recipe_id
      and recipes.user_id = auth.uid()
    )
  );

create policy "Users can CRUD their own recipe tags" on recipe_tags
  for all using (
    exists (
      select 1 from recipes
      where recipes.id = recipe_tags.recipe_id
      and recipes.user_id = auth.uid()
    )
  );

-- Meal Records
create policy "Users can CRUD their own meal records" on meal_records
  for all using (auth.uid() = user_id);

-- User Settings
create policy "Users can CRUD their own settings" on user_settings
  for all using (auth.uid() = user_id);

-- Storage
insert into storage.buckets (id, name, public) 
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload images" on storage.objects
  for insert with check (
    bucket_id = 'recipe-images' 
    and auth.role() = 'authenticated'
  );

create policy "Users can update/delete their own images" on storage.objects
  for update using (
    bucket_id = 'recipe-images' 
    and auth.uid() = owner
  );

create policy "Users can delete their own images" on storage.objects
  for delete using (
    bucket_id = 'recipe-images' 
    and auth.uid() = owner
  );

create policy "Anyone can view images" on storage.objects
  for select using (bucket_id = 'recipe-images');
