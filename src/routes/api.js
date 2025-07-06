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

// POST /api/fetch-events - Fetch CSE events from external APIs for review
router.post('/fetch-events', async (req, res) => {
  try {
    console.log('Fetching CSE events for review...');
    
    // Fetch events from all external APIs (without saving)
    const apiResults = await multiAPIService.fetchAllEvents();
    
    if (apiResults.events.length === 0) {
      return res.json({
        message: 'No CSE events found from external APIs',
        events: [],
        summary: apiResults.summary,
        requiresApproval: false
      });
    }

    res.json({
      message: `Found ${apiResults.events.length} CSE events for review`,
      events: apiResults.events,
      summary: apiResults.summary,
      requiresApproval: true
    });
  } catch (error) {
    console.error('Error fetching external events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch CSE events from external APIs',
      details: error.message 
    });
  }
});

// POST /api/approve-events - Save approved events to file
router.post('/approve-events', async (req, res) => {
  try {
    const { approvedEvents } = req.body;
    
    if (!approvedEvents || !Array.isArray(approvedEvents)) {
      return res.status(400).json({ 
        error: 'Invalid request - approvedEvents array is required' 
      });
    }

    console.log(`Approving ${approvedEvents.length} events...`);
    
    // Save approved events
    const result = await multiAPIService.saveApprovedEvents(approvedEvents);
    
    let message;
    if (result.newApprovedEvents > 0) {
      message = `Successfully added ${result.newApprovedEvents} new events to your schedule`;
      if (result.duplicatesSkipped > 0) {
        message += ` (${result.duplicatesSkipped} duplicates skipped)`;
      }
    } else {
      message = 'All selected events were already in your schedule';
    }
    
    res.json({
      message,
      totalEvents: result.totalSaved,
      newEvents: result.newApprovedEvents,
      duplicatesSkipped: result.duplicatesSkipped
    });
  } catch (error) {
    console.error('Error approving events:', error);
    res.status(500).json({ 
      error: 'Failed to approve and save events',
      details: error.message 
    });
  }
});

// GET /api/search - Advanced search with multiple criteria
router.get('/search', async (req, res) => {
  try {
    const {
      q: query = '',
      category = '',
      location = '',
      dateFrom = '',
      dateTo = '',
      fuzzy = 'false',
      sortBy = 'date',
      sortOrder = 'asc',
      limit = '50'
    } = req.query;

    const scheduler = await dataService.getEventScheduler();
    
    const searchCriteria = {
      query,
      category,
      location,
      dateFrom,
      dateTo,
      fuzzy: fuzzy === 'true',
      sortBy,
      sortOrder
    };

    const results = scheduler.advancedSearch(searchCriteria);
    const limitedResults = results.slice(0, parseInt(limit));

    res.json({
      query: searchCriteria,
      totalResults: results.length,
      results: limitedResults,
      hasMore: results.length > parseInt(limit)
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// GET /api/search/suggestions - Get autocomplete suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q: query = '', limit = '10' } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const scheduler = await dataService.getEventScheduler();
    const suggestions = scheduler.getAutocompleteSuggestions(query, parseInt(limit));

    res.json({ suggestions });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions', details: error.message });
  }
});

// GET /api/search/ranked - Ranked search with relevance scoring
router.get('/search/ranked', async (req, res) => {
  try {
    const { q: query = '', limit = '20' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const scheduler = await dataService.getEventScheduler();
    const results = scheduler.rankedSearch(query);
    const limitedResults = results.slice(0, parseInt(limit));

    res.json({
      query,
      totalResults: results.length,
      results: limitedResults,
      hasMore: results.length > parseInt(limit)
    });
  } catch (error) {
    console.error('Error in ranked search:', error);
    res.status(500).json({ error: 'Ranked search failed', details: error.message });
  }
});

// GET /api/search/date - Binary search by specific date
router.get('/search/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const scheduler = await dataService.getEventScheduler();
    const results = scheduler.binarySearchByDate(date);

    res.json({
      date,
      totalResults: results.length,
      results
    });
  } catch (error) {
    console.error('Error in date search:', error);
    res.status(500).json({ error: 'Date search failed', details: error.message });
  }
});

// GET /api/search/indexed - Fast indexed search
router.get('/search/indexed', async (req, res) => {
  try {
    const { q: query = '', type = 'title' } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const scheduler = await dataService.getEventScheduler();
    const results = scheduler.indexedSearch(query, type);

    res.json({
      query,
      type,
      totalResults: results.length,
      results
    });
  } catch (error) {
    console.error('Error in indexed search:', error);
    res.status(500).json({ error: 'Indexed search failed', details: error.message });
  }
});

// GET /api/sort - Sort events with various criteria
router.get('/sort', async (req, res) => {
  try {
    const { 
      sortBy = 'date', 
      sortOrder = 'asc',
      limit = '50'
    } = req.query;

    const scheduler = await dataService.getEventScheduler();
    const sortedEvents = scheduler.sortEvents(scheduler.getAllEvents(), sortBy, sortOrder);
    const limitedResults = sortedEvents.slice(0, parseInt(limit));

    res.json({
      sortBy,
      sortOrder,
      totalResults: sortedEvents.length,
      results: limitedResults,
      hasMore: sortedEvents.length > parseInt(limit)
    });
  } catch (error) {
    console.error('Error sorting events:', error);
    res.status(500).json({ error: 'Sort failed', details: error.message });
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