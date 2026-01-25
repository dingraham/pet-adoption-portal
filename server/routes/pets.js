import express from 'express';
import { readDB, writeDB } from '../utils/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all pets with filtering and pagination
router.get('/', async (req, res) => {
  try {
    let pets = await readDB('pets.json');
    const {
      species,
      age,
      size,
      gender,
      specialNeeds,
      goodWith,
      search,
      status = 'available',
      page = 1,
      limit = 12,
      sortBy = 'dateAdded',
      sortOrder = 'desc'
    } = req.query;

    // Filter by status
    pets = pets.filter(pet => pet.status === status);

    // Apply filters
    if (species) {
      pets = pets.filter(pet => pet.species === species);
    }
    if (age) {
      pets = pets.filter(pet => pet.ageCategory === age);
    }
    if (size) {
      pets = pets.filter(pet => pet.size === size);
    }
    if (gender) {
      pets = pets.filter(pet => pet.gender === gender);
    }
    if (specialNeeds) {
      pets = pets.filter(pet => pet.specialNeeds === (specialNeeds === 'true'));
    }
    if (goodWith) {
      const goodWithArray = goodWith.split(',');
      pets = pets.filter(pet =>
        goodWithArray.every(item => pet.goodWith?.includes(item))
      );
    }
    if (search) {
      // Sanitize search input to prevent regex injection
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchLower = sanitizedSearch.toLowerCase().trim();

      // Limit search length to prevent performance issues
      if (searchLower.length > 100) {
        return res.status(400).json({ error: 'Search query too long' });
      }

      pets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchLower) ||
        pet.description.toLowerCase().includes(searchLower) ||
        pet.breed.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    pets.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'dateAdded') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPets = pets.slice(startIndex, endIndex);

    res.json({
      pets: paginatedPets,
      totalCount: pets.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(pets.length / limit)
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pet by ID
router.get('/:id', async (req, res) => {
  try {
    const pets = await readDB('pets.json');
    const pet = pets.find(p => p.id === req.params.id);

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create pet (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pets = await readDB('pets.json');

    const newPet = {
      id: Date.now().toString(),
      ...req.body,
      status: 'available',
      dateAdded: new Date().toISOString()
    };

    pets.push(newPet);
    await writeDB('pets.json', pets);

    res.status(201).json(newPet);
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update pet (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pets = await readDB('pets.json');
    const index = pets.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    pets[index] = {
      ...pets[index],
      ...req.body,
      id: req.params.id,
      dateAdded: pets[index].dateAdded
    };

    await writeDB('pets.json', pets);
    res.json(pets[index]);
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete pet (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pets = await readDB('pets.json');
    const filteredPets = pets.filter(p => p.id !== req.params.id);

    if (pets.length === filteredPets.length) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    await writeDB('pets.json', filteredPets);
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
