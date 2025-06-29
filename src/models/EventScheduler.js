const crypto = require('crypto');

class EventScheduler {
  constructor() {
    this.events = [];
  }

  // Generate unique ID for events
  generateId() {
    return crypto.randomUUID();
  }

  // Add a new event
  addEvent(eventData) {
    const event = {
      id: this.generateId(),
      title: eventData.title,
      description: eventData.description || '',
      date: eventData.date,
      time: eventData.time,
      datetime: eventData.datetime || this.combineDatetime(eventData.date, eventData.time),
      location: eventData.location || '',
      category: eventData.category || 'technology',
      url: eventData.url || '',
      source: eventData.source || 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.events.push(event);
    return event;
  }

  // Update an existing event
  updateEvent(id, eventData) {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) {
      throw new Error('Event not found');
    }

    const existingEvent = this.events[index];
    const updatedEvent = {
      ...existingEvent,
      title: eventData.title || existingEvent.title,
      description: eventData.description !== undefined ? eventData.description : existingEvent.description,
      date: eventData.date || existingEvent.date,
      time: eventData.time || existingEvent.time,
      datetime: eventData.datetime || this.combineDatetime(eventData.date || existingEvent.date, eventData.time || existingEvent.time),
      location: eventData.location !== undefined ? eventData.location : existingEvent.location,
      category: eventData.category || existingEvent.category,
      url: eventData.url !== undefined ? eventData.url : existingEvent.url,
      updatedAt: new Date().toISOString()
    };

    this.events[index] = updatedEvent;
    return updatedEvent;
  }

  // Delete an event
  deleteEvent(id) {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) {
      throw new Error('Event not found');
    }

    const deletedEvent = this.events.splice(index, 1)[0];
    return deletedEvent;
  }

  // Get an event by ID
  getEvent(id) {
    const event = this.events.find(event => event.id === id);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  // Get all events
  getAllEvents() {
    return [...this.events];
  }

  // Get events by category
  getEventsByCategory(category) {
    return this.events.filter(event => event.category === category);
  }

  // Get events by date range
  getEventsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.events.filter(event => {
      const eventDate = new Date(event.datetime || event.date);
      return eventDate >= start && eventDate <= end;
    });
  }

  // Get upcoming events
  getUpcomingEvents() {
    const now = new Date();
    return this.events.filter(event => {
      const eventDate = new Date(event.datetime || event.date);
      return eventDate > now;
    }).sort((a, b) => new Date(a.datetime || a.date) - new Date(b.datetime || b.date));
  }

  // Get past events
  getPastEvents() {
    const now = new Date();
    return this.events.filter(event => {
      const eventDate = new Date(event.datetime || event.date);
      return eventDate < now;
    }).sort((a, b) => new Date(b.datetime || b.date) - new Date(a.datetime || a.date));
  }

  // Search events
  searchEvents(query) {
    const searchTerm = query.toLowerCase();
    return this.events.filter(event => 
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.location.toLowerCase().includes(searchTerm) ||
      event.category.toLowerCase().includes(searchTerm)
    );
  }

  // Get event statistics
  getStatistics() {
    const total = this.events.length;
    const now = new Date();
    
    const upcoming = this.events.filter(event => {
      const eventDate = new Date(event.datetime || event.date);
      return eventDate > now;
    }).length;

    const completed = this.events.filter(event => {
      const eventDate = new Date(event.datetime || event.date);
      return eventDate < now;
    }).length;

    const ongoing = this.events.filter(event => {
      const eventDate = new Date(event.datetime || event.date);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length;

    const categories = {};
    this.events.forEach(event => {
      categories[event.category] = (categories[event.category] || 0) + 1;
    });

    const sources = {};
    this.events.forEach(event => {
      sources[event.source] = (sources[event.source] || 0) + 1;
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
  }

  // Load events from array
  loadEvents(eventsArray) {
    this.events = eventsArray.map(event => ({
      ...event,
      id: event.id || this.generateId()
    }));
  }

  // Clear all events
  clearAllEvents() {
    this.events = [];
  }

  // Add multiple events (bulk operation)
  addMultipleEvents(eventsArray) {
    const addedEvents = [];
    eventsArray.forEach(eventData => {
      try {
        const event = this.addEvent(eventData);
        addedEvents.push(event);
      } catch (error) {
        console.error('Error adding event:', error);
      }
    });
    return addedEvents;
  }

  // Check for duplicate events (by title, date, and location)
  isDuplicate(eventData) {
    return this.events.some(event => 
      event.title.toLowerCase() === eventData.title.toLowerCase() &&
      event.date === eventData.date &&
      event.location.toLowerCase() === (eventData.location || '').toLowerCase()
    );
  }

  // Remove duplicates based on title, date, and location
  removeDuplicates() {
    const seen = new Set();
    const uniqueEvents = [];

    this.events.forEach(event => {
      const key = `${event.title.toLowerCase()}-${event.date}-${event.location.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEvents.push(event);
      }
    });

    const removedCount = this.events.length - uniqueEvents.length;
    this.events = uniqueEvents;
    return removedCount;
  }

  // Combine date and time into datetime
  combineDatetime(date, time) {
    if (!date) return null;
    
    if (time) {
      return `${date}T${time}:00.000Z`;
    } else {
      return `${date}T00:00:00.000Z`;
    }
  }

  // Validate event data
  validateEvent(eventData) {
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

  // Sort events by date
  sortEventsByDate(ascending = true) {
    this.events.sort((a, b) => {
      const dateA = new Date(a.datetime || a.date);
      const dateB = new Date(b.datetime || b.date);
      return ascending ? dateA - dateB : dateB - dateA;
    });
    return this.events;
  }
}

module.exports = EventScheduler;