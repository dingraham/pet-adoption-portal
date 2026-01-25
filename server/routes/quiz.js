import express from 'express';
import { readDB, writeDB } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Calculate match score based on quiz answers
function calculateMatchScore(quizAnswers, pet) {
  let score = 0;
  const maxScore = 100;

  // Activity level match (20 points)
  if (quizAnswers.activityLevel === pet.activityLevel) {
    score += 20;
  } else if (
    (quizAnswers.activityLevel === 'high' && pet.activityLevel === 'moderate') ||
    (quizAnswers.activityLevel === 'moderate' && pet.activityLevel === 'high') ||
    (quizAnswers.activityLevel === 'moderate' && pet.activityLevel === 'low') ||
    (quizAnswers.activityLevel === 'low' && pet.activityLevel === 'moderate')
  ) {
    score += 10;
  }

  // Size preference (15 points)
  const sizePreferences = quizAnswers.sizePreference || [];
  if (sizePreferences.includes(pet.size)) {
    score += 15;
  }

  // Species preference (15 points)
  if (quizAnswers.speciesPreference === pet.species) {
    score += 15;
  }

  // Living situation match (15 points)
  if (quizAnswers.housingType === 'house' && pet.needsYard && quizAnswers.hasYard) {
    score += 15;
  } else if (!pet.needsYard) {
    score += 15;
  } else if (quizAnswers.housingType === 'apartment' && !pet.needsYard) {
    score += 10;
  }

  // Experience level (10 points)
  if (quizAnswers.experience === 'experienced' || pet.goodForFirstTime) {
    score += 10;
  } else if (quizAnswers.experience === 'some' && !pet.needsExperienced) {
    score += 7;
  }

  // Time commitment (10 points)
  if (quizAnswers.timeCommitment === 'high' || pet.timeRequirement !== 'high') {
    score += 10;
  } else if (quizAnswers.timeCommitment === 'moderate' && pet.timeRequirement === 'moderate') {
    score += 8;
  }

  // Good with kids (10 points)
  if (!quizAnswers.hasKids || pet.goodWith?.includes('kids')) {
    score += 10;
  }

  // Good with other pets (5 points)
  if (!quizAnswers.hasOtherPets || pet.goodWith?.includes('pets')) {
    score += 5;
  }

  return Math.min(score, maxScore);
}

// Submit quiz and get results
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const quizAnswers = req.body;
    const pets = await readDB('pets.json');
    const quizResults = await readDB('quizResults.json');

    // Calculate match scores for all available pets
    const matches = pets
      .filter(pet => pet.status === 'available')
      .map(pet => ({
        petId: pet.id,
        score: calculateMatchScore(quizAnswers, pet)
      }))
      .sort((a, b) => b.score - a.score);

    // Save quiz result
    const quizResult = {
      id: Date.now().toString(),
      userId: req.user.id,
      answers: quizAnswers,
      matches,
      createdAt: new Date().toISOString()
    };

    // Remove old quiz results for this user
    const filteredResults = quizResults.filter(r => r.userId !== req.user.id);
    filteredResults.push(quizResult);
    await writeDB('quizResults.json', filteredResults);

    res.json({ matches });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's quiz results
router.get('/results', authenticateToken, async (req, res) => {
  try {
    const quizResults = await readDB('quizResults.json');
    const userResult = quizResults.find(r => r.userId === req.user.id);

    if (!userResult) {
      return res.status(404).json({ error: 'No quiz results found' });
    }

    res.json(userResult);
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
