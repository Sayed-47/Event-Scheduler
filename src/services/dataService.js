const fs = require('fs').promises;
const path = require('path');
const EventScheduler = require('../models/EventScheduler');

class DataService {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.eventsFile = path.join(this.dataDir, 'events.json');
    this.eventScheduler = new EventScheduler();
  }

  // Get EventScheduler instance with loaded events
  async getEventScheduler() {
    const events = await this.loadEvents();
    this.eventScheduler.loadEvents(events);
    return this.eventScheduler;
  }

  // Ensure data directory and files exist
  async ensureDataStructure() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Check if events file exists, create if not
      try {
        await fs.access(this.eventsFile);
      } catch {
        await this.saveEvents([]);
      }
    } catch (error) {
      console.error('Error ensuring data structure:', error);
      throw error;
    }
  }

  // Load events from JSON file
  async loadEvents() {
    try {
      await this.ensureDataStructure();
      const data = await fs.readFile(this.eventsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading events:', error);
      // Return empty array if file doesn't exist or is corrupted
      return [];
    }
  }

  // Save events to JSON file
  async saveEvents(events) {
    try {
      await this.ensureDataStructure();
      const data = JSON.stringify(events, null, 2);
      await fs.writeFile(this.eventsFile, data, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving events:', error);
      throw error;
    }
  }

  // Add a single event
  async addEvent(eventData) {
    try {
      const events = await this.loadEvents();
      const newEvent = {
        id: this.generateId(),
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      events.push(newEvent);
      await this.saveEvents(events);
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  // Update an event
  async updateEvent(id, eventData) {
    try {
      const events = await this.loadEvents();
      const index = events.findIndex(event => event.id === id);
      
      if (index === -1) {
        throw new Error('Event not found');
      }

      const updatedEvent = {
        ...events[index],
        ...eventData,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      events[index] = updatedEvent;
      await this.saveEvents(events);
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Delete an event
  async deleteEvent(id) {
    try {
      const events = await this.loadEvents();
      const index = events.findIndex(event => event.id === id);
      
      if (index === -1) {
        throw new Error('Event not found');
      }

      const deletedEvent = events.splice(index, 1)[0];
      await this.saveEvents(events);
      return deletedEvent;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Get a single event by ID
  async getEvent(id) {
    try {
      const events = await this.loadEvents();
      const event = events.find(event => event.id === id);
      
      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  // Add multiple events (bulk operation)
  async addMultipleEvents(eventsArray) {
    try {
      const existingEvents = await this.loadEvents();
      const newEvents = eventsArray.map(eventData => ({
        id: this.generateId(),
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const allEvents = [...existingEvents, ...newEvents];
      await this.saveEvents(allEvents);
      return newEvents;
    } catch (error) {
      console.error('Error adding multiple events:', error);
      throw error;
    }
  }

  // Remove duplicate events
  async removeDuplicates() {
    try {
      const events = await this.loadEvents();
      const seen = new Set();
      const uniqueEvents = [];

      events.forEach(event => {
        const key = `${event.title?.toLowerCase()}-${event.date}-${event.location?.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueEvents.push(event);
        }
      });

      const removedCount = events.length - uniqueEvents.length;
      await this.saveEvents(uniqueEvents);
      return removedCount;
    } catch (error) {
      console.error('Error removing duplicates:', error);
      throw error;
    }
  }

  // Check if an event is a duplicate
  async isDuplicate(eventData) {
    try {
      const events = await this.loadEvents();
      return events.some(event => 
        event.title?.toLowerCase() === eventData.title?.toLowerCase() &&
        event.date === eventData.date &&
        event.location?.toLowerCase() === (eventData.location || '').toLowerCase()
      );
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  }

  // Get events statistics
  async getStatistics() {
    try {
      const events = await this.loadEvents();
      const total = events.length;
      const now = new Date();
      
      const upcoming = events.filter(event => {
        const eventDate = new Date(event.datetime || event.date);
        return eventDate > now;
      }).length;

      const completed = events.filter(event => {
        const eventDate = new Date(event.datetime || event.date);
        return eventDate < now;
      }).length;

      const ongoing = events.filter(event => {
        const eventDate = new Date(event.datetime || event.date);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      }).length;

      const categories = {};
      events.forEach(event => {
        const category = event.category || 'uncategorized';
        categories[category] = (categories[category] || 0) + 1;
      });

      const sources = {};
      events.forEach(event => {
        const source = event.source || 'manual';
        sources[source] = (sources[source] || 0) + 1;
      });

      return {
        total,
        upcoming,
        completed,
        ongoing,
        categories,
        sources,
        uniqueCategories: Object.keys(categories).length
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  // Search events
  async searchEvents(query) {
    try {
      const events = await this.loadEvents();
      const searchTerm = query.toLowerCase();
      
      return events.filter(event => 
        event.title?.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm) ||
        event.location?.toLowerCase().includes(searchTerm) ||
        event.category?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  }

  // Filter events by date range
  async getEventsByDateRange(startDate, endDate) {
    try {
      const events = await this.loadEvents();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return events.filter(event => {
        const eventDate = new Date(event.datetime || event.date);
        return eventDate >= start && eventDate <= end;
      });
    } catch (error) {
      console.error('Error filtering events by date range:', error);
      throw error;
    }
  }

  // Filter events by category
  async getEventsByCategory(category) {
    try {
      const events = await this.loadEvents();
      return events.filter(event => event.category === category);
    } catch (error) {
      console.error('Error filtering events by category:', error);
      throw error;
    }
  }

  // Backup events data
  async backupEvents() {
    try {
      const events = await this.loadEvents();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.dataDir, `events-backup-${timestamp}.json`);
      
      await fs.writeFile(backupFile, JSON.stringify(events, null, 2), 'utf8');
      return backupFile;
    } catch (error) {
      console.error('Error backing up events:', error);
      throw error;
    }
  }

  // Restore events from backup
  async restoreEvents(backupFile) {
    try {
      const data = await fs.readFile(backupFile, 'utf8');
      const events = JSON.parse(data);
      await this.saveEvents(events);
      return events.length;
    } catch (error) {
      console.error('Error restoring events:', error);
      throw error;
    }
  }

  // Clear all events
  async clearAllEvents() {
    try {
      await this.saveEvents([]);
      return true;
    } catch (error) {
      console.error('Error clearing events:', error);
      throw error;
    }
  }

  // Generate unique ID
  generateId() {
    return require('crypto').randomUUID();
  }

  // Validate event data
  validateEventData(eventData) {
    const errors = [];

    if (!eventData.title || eventData.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!eventData.date) {
      errors.push('Date is required');
    } else {
      const eventDate = new Date(eventData.date);
      if (isNaN(eventDate.getTime())) {
        errors.push('Invalid date format');
      }
    }

    if (eventData.url && !this.isValidUrl(eventData.url)) {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if URL is valid
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Get file path for events
  getEventsFilePath() {
    return this.eventsFile;
  }

  // Get data directory path
  getDataDirectory() {
    return this.dataDir;
  }
}

module.exports = DataService;
