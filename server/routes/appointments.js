import express from 'express';
import { readDB, writeDB } from '../utils/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's appointments
router.get('/my-appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await readDB('appointments.json');
    const userAppointments = appointments.filter(app => app.userId === req.user.id);

    res.json(userAppointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Schedule appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const appointments = await readDB('appointments.json');
    const { petId, date, time, notes } = req.body;

    if (!petId || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if time slot is available
    const existingAppointment = appointments.find(
      app => app.date === date && app.time === time && app.status !== 'cancelled'
    );

    if (existingAppointment) {
      return res.status(400).json({ error: 'Time slot not available' });
    }

    const newAppointment = {
      id: Date.now().toString(),
      userId: req.user.id,
      petId,
      date,
      time,
      notes: notes || '',
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    await writeDB('appointments.json', appointments);

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Schedule appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel appointment
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const appointments = await readDB('appointments.json');
    const index = appointments.findIndex(app => app.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointments[index].userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    appointments[index].status = 'cancelled';
    appointments[index].cancelledAt = new Date().toISOString();

    await writeDB('appointments.json', appointments);
    res.json(appointments[index]);
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available time slots for a date
router.get('/available-slots', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date required' });
    }

    const appointments = await readDB('appointments.json');

    // Define available time slots
    const allSlots = [
      '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    // Filter out booked slots
    const bookedSlots = appointments
      .filter(app => app.date === date && app.status === 'scheduled')
      .map(app => app.time);

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ date, availableSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
