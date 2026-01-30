import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Prisma, PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// Serve static files from uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'server/uploads')));

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Types
interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

// Auth Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Helpers
const toCamelCase = (o: any): any => {
  if (Array.isArray(o)) {
    return o.map(toCamelCase);
  } else if (o !== null && typeof o === 'object') {
    return Object.keys(o).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = toCamelCase(o[key]);
      return result;
    }, {} as any);
  }
  return o;
};

const toSnakeCase = (o: any): any => {
  if (Array.isArray(o)) {
    return o.map(toSnakeCase);
  } else if (o !== null && typeof o === 'object' && !(o instanceof Date)) {
    return Object.keys(o).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(o[key]);
      return result;
    }, {} as any);
  }
  return o;
};

// --- Routes ---

// Auth
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Recipes
app.get('/api/recipes', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        ingredients: true,
        steps: { orderBy: { stepNumber: 'asc' } },
        tags: true
      }
    });
    
    // Parse images JSON and convert to snake_case
    const parsedRecipes = recipes.map((r: any) => ({
      ...r,
      images: JSON.parse(r.images)
    }));
    
    res.json(toSnakeCase(parsedRecipes));
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.get('/api/recipes/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const recipe = await prisma.recipe.findFirst({
      where: { id: req.params.id as string, userId: req.user!.id },
      include: {
        ingredients: true,
        steps: { orderBy: { stepNumber: 'asc' } },
        tags: true
      }
    });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    
    const parsedRecipe = { ...recipe, images: JSON.parse(recipe.images) };
    res.json(toSnakeCase(parsedRecipe));
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

app.post('/api/recipes', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Convert request body to camelCase
    const camelBody = toCamelCase(req.body);
    const { ingredients, steps, tags, images, ...data } = camelBody;

    const recipe = await prisma.recipe.create({
      data: {
        ...data,
        userId: req.user!.id,
        images: JSON.stringify(images || []),
        ingredients: { create: ingredients },
        steps: { create: steps },
        tags: { create: tags }
      },
      include: { ingredients: true, steps: true, tags: true }
    });
    
    const parsedRecipe = { ...recipe, images: JSON.parse(recipe.images) };
    res.json(toSnakeCase(parsedRecipe));
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

app.put('/api/recipes/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const camelBody = toCamelCase(req.body);
    const { ingredients, steps, tags, images, ...data } = camelBody;
    
    // Transaction to update recipe and replace relations
    const updatedRecipe = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Verify ownership
      const exists = await tx.recipe.findFirst({ where: { id: id as string, userId: req.user!.id } });
      if (!exists) throw new Error('Not found');

      // Update basic info
      const recipe = await tx.recipe.update({
        where: { id: id as string },
        data: {
          ...data,
          images: JSON.stringify(images || [])
        }
      });

      // Replace ingredients
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id as string } });
      if (ingredients?.length) {
        await tx.recipeIngredient.createMany({
          data: ingredients.map((i: any) => ({ ...i, recipeId: id }))
        });
      }

      // Replace steps
      await tx.cookingStep.deleteMany({ where: { recipeId: id as string } });
      if (steps?.length) {
        await tx.cookingStep.createMany({
          data: steps.map((s: any) => ({ ...s, recipeId: id }))
        });
      }

      // We should also return the full object with relations
      return await tx.recipe.findUnique({
        where: { id: id as string },
        include: { ingredients: true, steps: true, tags: true }
      });
    });

    if (!updatedRecipe) throw new Error('Failed to retrieve updated recipe');

    const parsedRecipe = { ...updatedRecipe, images: JSON.parse(updatedRecipe.images) };
    res.json(toSnakeCase(parsedRecipe));
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    await prisma.recipe.deleteMany({ where: { id: req.params.id as string, userId: req.user!.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Upload
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Return relative path
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
