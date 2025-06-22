import express from 'express';
import multer from 'multer';
import EventScheduler from '../models/EventScheduler.js';
import dataService from '../services/dataService.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Simulate external API fetch
router.get('/fetch-external', async (req, res) => {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockEvents = [
            {
                title: "DevFest Bangladesh 2025",
                dateTime: "2025-09-15T14:00",
                location: "International Convention City Bashundhara",
                description: "Google Developer Group's annual technology festival",
                source: "Facebook"
            },
            {
                title: "Startup Weekend Dhaka",
                dateTime: "2025-08-22T18:00",
                location: "BRAC University",
                description: "54-hour startup creation event",
                source: "Website"
            },
            {
                title: "Women in Tech Conference",
                dateTime: "2025-08-10T09:00",
                location: "Radisson Blu Dhaka",
                description: "Empowering women in technology",
                source: "Email"
            }
        ];

        // Randomly return 0-3 events
        const randomEvents = mockEvents.slice(0, Math.floor(Math.random() * 4));

        res.json({
            success: true,
            data: randomEvents,
            message: `Fetched ${randomEvents.length} events from external sources`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching external events',
            error: error.message
        });
    }
});

// Import events from JSON file
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fs = await import('fs/promises');
        const fileContent = await fs.readFile(req.file.path, 'utf8');
        const importedData = JSON.parse(fileContent);

        // Validate imported data
        if (!importedData.events || !Array.isArray(importedData.events)) {
            // Clean up uploaded file
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Invalid file format: missing events array'
            });
        }

        // Load current scheduler
        const currentData = await dataService.loadEvents();
        const scheduler = new EventScheduler();
        scheduler.loadEvents(currentData);

        let addedCount = 0;
        
        // Add imported events
        importedData.events.forEach(eventData => {
            // Check for duplicates
            const exists = scheduler.events.some(existing => 
                existing.title === eventData.title && 
                new Date(existing.date).getTime() === new Date(eventData.date).getTime()
            );

            if (!exists) {
                scheduler.addEvent({
                    title: eventData.title,
                    dateTime: eventData.date,
                    location: eventData.location,
                    description: eventData.description,
                    source: eventData.source
                });
                addedCount++;
            }
        });

        // Update next ID
        if (scheduler.events.length > 0) {
            scheduler.nextId = Math.max(...scheduler.events.map(e => e.id)) + 1;
        }

        // Save updated data
        await dataService.saveEvents(scheduler.getAllEvents());

        // Clean up uploaded file
        await fs.unlink(req.file.path);

        res.json({
            success: true,
            message: `Successfully imported ${addedCount} new events`,
            data: { addedCount, totalEvents: scheduler.events.length }
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
            try {
                const fs = await import('fs/promises');
                await fs.unlink(req.file.path);
            } catch {}
        }
        
        res.status(500).json({
            success: false,
            message: 'Error importing events',
            error: error.message
        });
    }
});

// Export events (redirects to events route)
router.get('/export', (req, res) => {
    res.redirect('/api/events/export/json');
});

// Get backups
router.get('/backups', async (req, res) => {
    try {
        const backups = await dataService.getBackups();
        
        res.json({
            success: true,
            data: backups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching backups',
            error: error.message
        });
    }
});

// Clear all events
router.delete('/clear-all', async (req, res) => {
    try {
        const scheduler = new EventScheduler();
        await dataService.saveEvents(scheduler.getAllEvents());

        res.json({
            success: true,
            message: 'All events cleared successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing events',
            error: error.message
        });
    }
});

export default router;