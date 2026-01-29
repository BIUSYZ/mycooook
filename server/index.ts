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
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email } });
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email });
});

// Recipes
app.get('/api/recipes', authenticateToken, async (req: AuthRequest, res) => {
  const recipes = await prisma.recipe.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: {
      ingredients: true,
      steps: { orderBy: { stepNumber: 'asc' } },
      tags: true
    }
  });
  
  // Parse images JSON
  const parsedRecipes = recipes.map((r: any) => ({
    ...r,
    images: JSON.parse(r.images)
  }));
  
  res.json(parsedRecipes);
});

app.get('/api/recipes/:id', authenticateToken, async (req: AuthRequest, res) => {
  const recipe = await prisma.recipe.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: {
      ingredients: true,
      steps: { orderBy: { stepNumber: 'asc' } },
      tags: true
    }
  });
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  res.json({ ...recipe, images: JSON.parse(recipe.images) });
});

app.post('/api/recipes', authenticateToken, async (req: AuthRequest, res) => {
  const { ingredients, steps, tags, images, ...data } = req.body;
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
  res.json({ ...recipe, images: JSON.parse(recipe.images) });
});

app.put('/api/recipes/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { ingredients, steps, tags, images, ...data } = req.body;
  
  // Transaction to update recipe and replace relations
  const updatedRecipe = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Verify ownership
    const exists = await tx.recipe.findFirst({ where: { id, userId: req.user!.id } });
    if (!exists) throw new Error('Not found');

    // Update basic info
    const recipe = await tx.recipe.update({
      where: { id },
      data: {
        ...data,
        images: JSON.stringify(images || [])
      }
    });

    // Replace ingredients
    await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
    if (ingredients?.length) {
      await tx.recipeIngredient.createMany({
        data: ingredients.map((i: any) => ({ ...i, recipeId: id }))
      });
    }

    // Replace steps
    await tx.cookingStep.deleteMany({ where: { recipeId: id } });
    if (steps?.length) {
      await tx.cookingStep.createMany({
        data: steps.map((s: any) => ({ ...s, recipeId: id }))
      });
    }

    return recipe;
  });

  res.json(updatedRecipe);
});

app.delete('/api/recipes/:id', authenticateToken, async (req: AuthRequest, res) => {
  await prisma.recipe.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
  res.json({ success: true });
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
