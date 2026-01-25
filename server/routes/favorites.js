import express from 'express';
import { readDB, writeDB } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const favorites = await readDB('favorites.json');
    const userFavorites = favorites.filter(fav => fav.userId === req.user.id);

    res.json(userFavorites.map(fav => fav.petId));
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to favorites
router.post('/:petId', authenticateToken, async (req, res) => {
  try {
    const favorites = await readDB('favorites.json');
    const { petId } = req.params;

    // Check if already favorited
    const existing = favorites.find(
      fav => fav.userId === req.user.id && fav.petId === petId
    );

    if (existing) {
      return res.status(400).json({ error: 'Pet already in favorites' });
    }

    const newFavorite = {
      id: Date.now().toString(),
      userId: req.user.id,
      petId,
      createdAt: new Date().toISOString()
    };

    favorites.push(newFavorite);
    await writeDB('favorites.json', favorites);

    res.status(201).json({ message: 'Added to favorites', petId });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from favorites
router.delete('/:petId', authenticateToken, async (req, res) => {
  try {
    const favorites = await readDB('favorites.json');
    const { petId } = req.params;

    const filteredFavorites = favorites.filter(
      fav => !(fav.userId === req.user.id && fav.petId === petId)
    );

    await writeDB('favorites.json', filteredFavorites);
    res.json({ message: 'Removed from favorites', petId });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
