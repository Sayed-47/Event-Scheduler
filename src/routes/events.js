import express from 'express';
import EventScheduler from '../Models/EventScheduler.js';
import dataService from '../services/dataService.js';

const router = express.Router();
const scheduler = new EventScheduler();

let isInitialized = false;

async function initializeScheduler() {
    if (!isInitialized) {
        try {
            const data = await dataService.loadEvents();
            scheduler.loadEvents(data);
            isInitialized = true;
            console.log(`📊 Loaded ${data.events.length} events`);
        } catch (error) {
            console.error('Error initializing scheduler:', error);
        }
    }
}

// Get all events
router.get('/', async (req, res) => {
    try {
        await initializeScheduler();
        
        const { search, sort, startDate, endDate, source } = req.query;
        let events = scheduler.events;

        if (search) {
            events = scheduler.search(search);
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            events = scheduler.getEventsInDateRange(start, end);
        }

        if (source && source !== 'all') {
            events = events.filter(event => event.source === source);
        }

        if (sort) {
            const sortedEvents = [...events];
            switch (sort) {
                case 'date':
                    sortedEvents.sort((a, b) => a.date - b.date);
                    break;
                case 'title':
                    sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'location':
                    sortedEvents.sort((a, b) => a.location.localeCompare(b.location));
                    break;
                case 'source':
                    sortedEvents.sort((a, b) => a.source.localeCompare(b.source));
                    break;
                default:
                    sortedEvents.sort((a, b) => a.date - b.date);
            }
            events = sortedEvents;
        }

        res.json({
            success: true,
            data: events,
            total: events.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
});

// Add new event
router.post('/', async (req, res) => {
    console.log('POST /api/events called with body:', req.body);
    try {
        await initializeScheduler();
        
        const { title, dateTime, location, description, source } = req.body;

        if (!title || !dateTime || !location || !source) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, dateTime, location, source'
            });
        }

        const eventDate = new Date(dateTime);
        if (eventDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Event date must be in the future'
            });
        }

        const eventData = {
            title,
            dateTime,
            location,
            description: description || 'No description provided',
            source
        };        const newEvent = scheduler.addEvent(eventData);
        console.log('Event added to scheduler:', newEvent);
        
        await dataService.saveEvents(scheduler.getAllEvents());
        console.log('Events saved to file');

        console.log('Event created successfully:', newEvent);
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: newEvent
        });
    } catch (error) {
        console.error('Detailed error creating event:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
    try {
        await initializeScheduler();
        
        const eventId = parseInt(req.params.id);
        const deleted = scheduler.deleteEvent(eventId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        await dataService.saveEvents(scheduler.getAllEvents());

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
    try {
        await initializeScheduler();
        
        const stats = scheduler.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

// Export events as JSON
router.get('/export/json', async (req, res) => {
    try {
        await initializeScheduler();
        
        const events = scheduler.getAllEvents();
        const exportData = {
            exportDate: new Date().toISOString(),
            totalEvents: events.length,
            events: events
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="events_export_${new Date().toISOString().split('T')[0]}.json"`);
        
        res.json(exportData);
    } catch (error) {
        console.error('Error exporting events:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting events',
            error: error.message
        });
    }
});

export default router;