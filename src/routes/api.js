const express = require('express');
const router = express.Router();
const DataService = require('../services/dataService');
const MultiAPIService = require('../services/multiAPIService');

const dataService = new DataService();
const multiAPIService = new MultiAPIService();

// GET /api/stats - Get event statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await dataService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// POST /api/fetch-events - Fetch events from external APIs
router.post('/fetch-events', async (req, res) => {
  try {
    console.log('Starting external event fetch...');
    
    // Fetch events from all external APIs
    const apiResults = await multiAPIService.fetchAllEvents();
    
    if (apiResults.events.length === 0) {
      return res.json({
        message: 'No new events found from external APIs',
        newEvents: 0,
        summary: apiResults.summary
      });
    }

    // Load existing events
    const existingEvents = await dataService.loadEvents();
    console.log(`Found ${existingEvents.length} existing events`);

    // Filter out events that already exist
    const newEvents = [];
    for (const apiEvent of apiResults.events) {
      const isDuplicate = existingEvents.some(existing => 
        existing.title.toLowerCase() === apiEvent.title.toLowerCase() &&
        existing.date === apiEvent.date &&
        (existing.location || '').toLowerCase() === (apiEvent.location || '').toLowerCase()
      );

      if (!isDuplicate) {
        newEvents.push(apiEvent);
      }
    }

    console.log(`Found ${newEvents.length} new unique events to add`);

    // Add new events to storage
    if (newEvents.length > 0) {
      await dataService.addMultipleEvents(newEvents);
    }

    res.json({
      message: `Successfully fetched ${newEvents.length} new events from external APIs`,
      newEvents: newEvents.length,
      totalFetched: apiResults.events.length,
      duplicatesSkipped: apiResults.events.length - newEvents.length,
      summary: apiResults.summary
    });
  } catch (error) {
    console.error('Error fetching external events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events from external APIs',
      details: error.message 
    });
  }
});

// GET /api/health - Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check data service
    const events = await dataService.loadEvents();
    
    // Check external APIs status
    const apiStatus = multiAPIService.getAPIStatus();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      data: {
        eventsCount: events.length,
        dataService: 'operational'
      },
      externalAPIs: apiStatus
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;