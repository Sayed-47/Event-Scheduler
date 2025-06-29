const express = require('express');
const router = express.Router();
const DataService = require('../services/dataService');

const dataService = new DataService();

// GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    const events = await dataService.loadEvents();
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// GET /api/events/:id - Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await dataService.getEvent(req.params.id);
    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    if (error.message === 'Event not found') {
      res.status(404).json({ error: 'Event not found' });
    } else {
      res.status(500).json({ error: 'Failed to retrieve event' });
    }
  }
});

// POST /api/events - Create new event
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const { title, date } = req.body;
    if (!title || !date) {
      return res.status(400).json({ 
        error: 'Title and date are required fields' 
      });
    }

    // Validate event data
    const validation = dataService.validateEventData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    // Check for duplicates
    const isDuplicate = await dataService.isDuplicate(req.body);
    if (isDuplicate) {
      return res.status(409).json({ 
        error: 'An event with the same title, date, and location already exists' 
      });
    }

    // Create the event
    const newEvent = await dataService.addEvent(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req, res) => {
  try {
    // Validate event data if provided
    if (Object.keys(req.body).length > 0) {
      const validation = dataService.validateEventData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.errors 
        });
      }
    }

    const updatedEvent = await dataService.updateEvent(req.params.id, req.body);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    if (error.message === 'Event not found') {
      res.status(404).json({ error: 'Event not found' });
    } else {
      res.status(500).json({ error: 'Failed to update event' });
    }
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req, res) => {
  try {
    const deletedEvent = await dataService.deleteEvent(req.params.id);
    res.json({ 
      message: 'Event deleted successfully', 
      event: deletedEvent 
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error.message === 'Event not found') {
      res.status(404).json({ error: 'Event not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete event' });
    }
  }
});

module.exports = router;
