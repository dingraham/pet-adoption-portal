import express from 'express';
import { readDB, writeDB } from '../utils/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get user's applications
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const applications = await readDB('applications.json');
    const userApplications = applications.filter((app) => app.userId === req.user.id);

    res.json(userApplications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all applications (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const applications = await readDB('applications.json');
    const { status } = req.query;

    let filtered = applications;
    if (status) {
      filtered = applications.filter((app) => app.status === status);
    }

    res.json(filtered);
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get application by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const applications = await readDB('applications.json');
    const application = applications.find((app) => app.id === req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if user owns this application or is admin
    if (application.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit application
router.post('/', authenticateToken, async (req, res) => {
  try {
    const applications = await readDB('applications.json');
    const { petId, dateOfBirth, email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    // Validate age (must be 18+)
    if (!dateOfBirth) {
      return res.status(400).json({ error: 'Date of birth is required' });
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return res
        .status(400)
        .json({ error: 'You must be at least 18 years old to submit an application' });
    }

    // Check if user already has a pending application for this pet
    const existingApp = applications.find(
      (app) =>
        app.userId === req.user.id &&
        app.petId === petId &&
        (app.status === 'pending' || app.status === 'under_review' || app.status === 'approved')
    );

    if (existingApp) {
      return res.status(400).json({ error: 'You already have an application for this pet' });
    }

    const newApplication = {
      id: Date.now().toString(),
      userId: req.user.id,
      petId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      ...req.body,
    };

    applications.push(newApplication);
    await writeDB('applications.json', applications);

    res.status(201).json(newApplication);
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update application status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const applications = await readDB('applications.json');
    const index = applications.findIndex((app) => app.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }

    applications[index].status = status;
    applications[index].reviewedAt = new Date().toISOString();
    if (notes) {
      applications[index].adminNotes = notes;
    }

    // If approved, update pet status to pending
    if (status === 'approved') {
      const pets = await readDB('pets.json');
      const petIndex = pets.findIndex((p) => p.id === applications[index].petId);
      if (petIndex !== -1) {
        pets[petIndex].status = 'pending';
        await writeDB('pets.json', pets);
      }
    }

    await writeDB('applications.json', applications);
    res.json(applications[index]);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
