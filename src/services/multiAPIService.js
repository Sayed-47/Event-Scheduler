const EventbriteService = require('./eventbriteService');
const TicketmasterService = require('./ticketmasterService');
const DataService = require('./dataService');

class MultiAPIService {
  constructor() {
    this.eventbriteService = new EventbriteService();
    this.ticketmasterService = new TicketmasterService();
    this.dataService = new DataService();
  }

  // Fetch events from all configured APIs and save to file (legacy method for auto-save)
  async fetchAndSaveEvents() {
    try {
      console.log('Starting to fetch CSE events from multiple APIs...');
      
      const results = {
        eventbrite: [],
        ticketmaster: [],
        errors: []
      };

      // Fetch from Eventbrite
      try {
        console.log('Fetching CSE events from Eventbrite...');
        results.eventbrite = await this.eventbriteService.fetchCSEEvents();
        console.log(`Successfully fetched ${results.eventbrite.length} real events from Eventbrite`);
      } catch (error) {
        console.error('Error fetching from Eventbrite:', error);
        results.errors.push({ source: 'eventbrite', error: error.message });
      }

      // Fetch from Ticketmaster
      try {
        console.log('Fetching CSE events from Ticketmaster...');
        results.ticketmaster = await this.ticketmasterService.fetchCSEEvents();
        console.log(`Successfully fetched ${results.ticketmaster.length} real events from Ticketmaster`);
      } catch (error) {
        console.error('Error fetching from Ticketmaster:', error);
        results.errors.push({ source: 'ticketmaster', error: error.message });
      }

      // Combine all events
      const allEvents = [...results.eventbrite, ...results.ticketmaster];
      console.log(`Total events fetched from APIs: ${allEvents.length}`);

      if (allEvents.length > 0) {
        // Remove duplicates
        const uniqueEvents = this.removeDuplicates(allEvents);
        console.log(`Unique events after deduplication: ${uniqueEvents.length}`);

        // Sort by date
        const sortedEvents = this.sortEventsByDate(uniqueEvents);

        // Get existing events from file
        const existingEvents = await this.dataService.loadEvents();
        
        // Filter out events that already exist
        const newEvents = sortedEvents.filter(newEvent => {
          return !existingEvents.some(existing => 
            existing.sourceId === newEvent.sourceId && existing.source === newEvent.source
          );
        });

        if (newEvents.length > 0) {
          // Add new events to existing events (don't replace)
          const combinedEvents = [...existingEvents, ...newEvents];
          await this.dataService.saveEvents(combinedEvents);
          console.log(`Added ${newEvents.length} new events to existing ${existingEvents.length} events`);
        } else {
          console.log('No new events to add - all fetched events already exist');
        }

        return {
          events: sortedEvents,
          summary: {
            total: sortedEvents.length,
            eventbrite: results.eventbrite.length,
            ticketmaster: results.ticketmaster.length,
            duplicatesRemoved: allEvents.length - uniqueEvents.length,
            newEvents: newEvents.length,
            errors: results.errors,
            saved: true
          }
        };
      } else {
        console.log('No events found from APIs.');
        
        return {
          events: [],
          summary: {
            total: 0,
            eventbrite: 0,
            ticketmaster: 0,
            duplicatesRemoved: 0,
            newEvents: 0,
            errors: results.errors,
            saved: false,
            message: 'No CSE events found from external APIs'
          }
        };
      }
    } catch (error) {
      console.error('Error in fetchAndSaveEvents:', error);
      throw error;
    }
  }

  // Fetch events from all configured APIs (without saving)
  async fetchAllEvents() {
    try {
      console.log('Starting to fetch CSE events from multiple APIs...');
      
      const results = {
        eventbrite: [],
        ticketmaster: [],
        errors: []
      };

      // Fetch from Eventbrite
      try {
        console.log('Fetching CSE events from Eventbrite...');
        results.eventbrite = await this.eventbriteService.fetchCSEEvents();
        console.log(`Successfully fetched ${results.eventbrite.length} real events from Eventbrite`);
      } catch (error) {
        console.error('Error fetching from Eventbrite:', error);
        results.errors.push({ source: 'eventbrite', error: error.message });
      }

      // Fetch from Ticketmaster
      try {
        console.log('Fetching CSE events from Ticketmaster...');
        results.ticketmaster = await this.ticketmasterService.fetchCSEEvents();
        console.log(`Successfully fetched ${results.ticketmaster.length} real events from Ticketmaster`);
      } catch (error) {
        console.error('Error fetching from Ticketmaster:', error);
        results.errors.push({ source: 'ticketmaster', error: error.message });
      }

      // Combine all events
      const allEvents = [...results.eventbrite, ...results.ticketmaster];
      console.log(`Total events fetched from APIs: ${allEvents.length}`);

      if (allEvents.length > 0) {
        // Remove duplicates
        const uniqueEvents = this.removeDuplicates(allEvents);
        console.log(`Unique events after deduplication: ${uniqueEvents.length}`);

        // Get existing events to filter out already saved events
        const existingEvents = await this.dataService.loadEvents();
        
        // Filter out events that already exist in the system
        const newEvents = uniqueEvents.filter(newEvent => {
          return !existingEvents.some(existing => 
            existing.sourceId === newEvent.sourceId && existing.source === newEvent.source
          );
        });

        console.log(`${newEvents.length} new events available for approval (${uniqueEvents.length - newEvents.length} already in system)`);

        // Sort by date
        const sortedEvents = this.sortEventsByDate(newEvents);

        return {
          events: sortedEvents,
          summary: {
            total: sortedEvents.length,
            eventbrite: results.eventbrite.length,
            ticketmaster: results.ticketmaster.length,
            duplicatesRemoved: allEvents.length - uniqueEvents.length,
            alreadyExists: uniqueEvents.length - newEvents.length,
            errors: results.errors,
            saved: false
          }
        };
      } else {
        return {
          events: [],
          summary: {
            total: 0,
            eventbrite: 0,
            ticketmaster: 0,
            duplicatesRemoved: 0,
            alreadyExists: 0,
            errors: results.errors,
            saved: false,
            message: 'No CSE events found from external APIs'
          }
        };
      }
    } catch (error) {
      console.error('Error in fetchAllEvents:', error);
      throw error;
    }
  }

  // Save approved events to file
  async saveApprovedEvents(approvedEvents) {
    try {
      console.log(`Saving ${approvedEvents.length} approved events...`);
      
      // Get existing events from file
      const existingEvents = await this.dataService.loadEvents();
      
      // Filter out events that already exist (check by sourceId to avoid duplicates)
      const newApprovedEvents = approvedEvents.filter(newEvent => {
        return !existingEvents.some(existing => 
          existing.sourceId === newEvent.sourceId && existing.source === newEvent.source
        );
      });

      console.log(`${newApprovedEvents.length} new events to add (${approvedEvents.length - newApprovedEvents.length} duplicates skipped)`);

      // Add new approved events to existing events
      const combinedEvents = [...existingEvents, ...newApprovedEvents];
      
      // Save to file
      await this.dataService.saveEvents(combinedEvents);
      console.log(`Saved ${combinedEvents.length} total events to file (added ${newApprovedEvents.length} new approved events)`);

      return {
        success: true,
        totalSaved: combinedEvents.length,
        existingEvents: existingEvents.length,
        newApprovedEvents: newApprovedEvents.length,
        duplicatesSkipped: approvedEvents.length - newApprovedEvents.length
      };
    } catch (error) {
      console.error('Error saving approved events:', error);
      throw error;
    }
  }

  // Remove duplicate events based on title, date, and location
  removeDuplicates(events) {
    const seen = new Map();
    const uniqueEvents = [];

    events.forEach(event => {
      // Create a key based on normalized title, date, and location
      const normalizedTitle = event.title.toLowerCase().trim();
      const normalizedLocation = (event.location || '').toLowerCase().trim();
      const eventDate = event.date;
      
      const key = `${normalizedTitle}-${eventDate}-${normalizedLocation}`;
      
      if (!seen.has(key)) {
        seen.set(key, true);
        uniqueEvents.push(event);
      } else {
        console.log(`Duplicate found and removed: ${event.title}`);
      }
    });

    return uniqueEvents;
  }

  // Sort events by date (upcoming first)
  sortEventsByDate(events) {
    return events.sort((a, b) => {
      const dateA = new Date(a.datetime || a.date);
      const dateB = new Date(b.datetime || b.date);
      return dateA - dateB;
    });
  }

  // Search events across all APIs
  async searchEvents(query, filters = {}) {
    try {
      const { events } = await this.fetchAllEvents();
      
      let filteredEvents = events;

      // Apply text search
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredEvents = filteredEvents.filter(event =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)
        );
      }

      // Apply category filter
      if (filters.category) {
        filteredEvents = filteredEvents.filter(event => 
          event.category === filters.category
        );
      }

      // Apply location filter
      if (filters.location) {
        const locationTerm = filters.location.toLowerCase();
        filteredEvents = filteredEvents.filter(event =>
          event.location.toLowerCase().includes(locationTerm)
        );
      }

      // Apply date range filter
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.datetime || event.date);
          return eventDate >= startDate && eventDate <= endDate;
        });
      }

      // Apply source filter
      if (filters.source) {
        filteredEvents = filteredEvents.filter(event => 
          event.source === filters.source
        );
      }

      return filteredEvents;
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  }

  // Get events by category from all APIs
  async getEventsByCategory(category) {
    try {
      const { events } = await this.fetchAllEvents();
      return events.filter(event => event.category === category);
    } catch (error) {
      console.error('Error getting events by category:', error);
      throw error;
    }
  }

  // Get upcoming events from all APIs
  async getUpcomingEvents(limit = null) {
    try {
      const { events } = await this.fetchAllEvents();
      const now = new Date();
      
      let upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.datetime || event.date);
        return eventDate > now;
      });

      // Sort by date (soonest first)
      upcomingEvents = this.sortEventsByDate(upcomingEvents);

      // Apply limit if specified
      if (limit) {
        upcomingEvents = upcomingEvents.slice(0, limit);
      }

      return upcomingEvents;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      throw error;
    }
  }

  // Get events statistics from all APIs
  async getEventsStatistics() {
    try {
      const { events, summary } = await this.fetchAllEvents();
      const now = new Date();

      const stats = {
        total: events.length,
        sources: {
          eventbrite: summary.eventbrite,
          ticketmaster: summary.ticketmaster
        },
        duplicatesRemoved: summary.duplicatesRemoved,
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        categories: {},
        locations: {},
        errors: summary.errors
      };

      events.forEach(event => {
        const eventDate = new Date(event.datetime || event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Count by status
        if (eventDate >= tomorrow) {
          stats.upcoming++;
        } else if (eventDate >= today) {
          stats.ongoing++;
        } else {
          stats.completed++;
        }

        // Count by category
        const category = event.category || 'uncategorized';
        stats.categories[category] = (stats.categories[category] || 0) + 1;

        // Count by location (city/state)
        const location = this.extractCity(event.location);
        if (location) {
          stats.locations[location] = (stats.locations[location] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting events statistics:', error);
      throw error;
    }
  }

  // Extract city from location string
  extractCity(location) {
    if (!location) return 'Unknown';
    
    // Try to extract city from various formats
    const parts = location.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim(); // Second to last part is usually the city
    } else {
      return parts[0].trim();
    }
  }

  // Get API status for all services
  getAPIStatus() {
    return {
      eventbrite: this.eventbriteService.getApiStatus(),
      ticketmaster: this.ticketmasterService.getApiStatus(),
      multiApi: {
        configured: true,
        availableServices: 2
      }
    };
  }

  // Test connectivity to all APIs
  async testConnectivity() {
    const results = {
      eventbrite: { available: false, error: null },
      ticketmaster: { available: false, error: null }
    };

    // Test Eventbrite
    try {
      await this.eventbriteService.fetchCSEEvents();
      results.eventbrite.available = true;
    } catch (error) {
      results.eventbrite.error = error.message;
    }

    // Test Ticketmaster
    try {
      await this.ticketmasterService.fetchCSEEvents();
      results.ticketmaster.available = true;
    } catch (error) {
      results.ticketmaster.error = error.message;
    }

    return results;
  }

  // Get events from a specific source
  async getEventsBySource(source) {
    try {
      switch (source.toLowerCase()) {
        case 'eventbrite':
          return await this.eventbriteService.fetchCSEEvents();
        case 'ticketmaster':
          return await this.ticketmasterService.fetchCSEEvents();
        default:
          throw new Error(`Unknown source: ${source}`);
      }
    } catch (error) {
      console.error(`Error getting events from ${source}:`, error);
      throw error;
    }
  }

  // Categorize and tag events intelligently
  categorizeEvents(events) {
    return events.map(event => {
      const enhancedEvent = { ...event };
      
      // Add tags based on content analysis
      enhancedEvent.tags = this.generateTags(event);
      
      // Enhance category if needed
      if (!event.category || event.category === 'technology') {
        enhancedEvent.category = this.smartCategorize(event);
      }
      
      return enhancedEvent;
    });
  }

  // Generate tags for an event
  generateTags(event) {
    const tags = new Set();
    const text = `${event.title} ${event.description}`.toLowerCase();
    
    // Technology tags
    if (text.includes('ai') || text.includes('artificial intelligence')) tags.add('AI');
    if (text.includes('machine learning') || text.includes('ml')) tags.add('Machine Learning');
    if (text.includes('data science') || text.includes('analytics')) tags.add('Data Science');
    if (text.includes('web dev') || text.includes('frontend') || text.includes('backend')) tags.add('Web Development');
    if (text.includes('mobile') || text.includes('ios') || text.includes('android')) tags.add('Mobile Development');
    if (text.includes('cloud') || text.includes('aws') || text.includes('azure')) tags.add('Cloud Computing');
    if (text.includes('security') || text.includes('cybersec')) tags.add('Security');
    if (text.includes('blockchain') || text.includes('crypto')) tags.add('Blockchain');
    
    // Event type tags
    if (text.includes('free') || event.priceRange === '$0') tags.add('Free');
    if (text.includes('online') || text.includes('virtual')) tags.add('Online');
    if (text.includes('hands-on') || text.includes('workshop')) tags.add('Hands-on');
    if (text.includes('networking')) tags.add('Networking');
    if (text.includes('career') || text.includes('job')) tags.add('Career');
    
    return Array.from(tags);
  }

  // Smart categorization based on content
  smartCategorize(event) {
    const text = `${event.title} ${event.description}`.toLowerCase();
    
    if (text.includes('conference') || text.includes('summit') || text.includes('expo')) {
      return 'conference';
    } else if (text.includes('workshop') || text.includes('training') || text.includes('bootcamp')) {
      return 'workshop';
    } else if (text.includes('networking') || text.includes('meetup') || text.includes('mixer')) {
      return 'networking';
    } else if (text.includes('business') || text.includes('startup') || text.includes('entrepreneur')) {
      return 'business';
    } else if (text.includes('education') || text.includes('university') || text.includes('course')) {
      return 'education';
    } else {
      return 'technology';
    }
  }
}

module.exports = MultiAPIService;
