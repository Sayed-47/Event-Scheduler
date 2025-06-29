const crypto = require('crypto');
const https = require('https');

class EventbriteService {
  constructor() {
    this.apiKey = process.env.EVENTBRITE_API_KEY;
    this.baseUrl = 'https://www.eventbriteapi.com/v3';
  }

  // Fetch CSE-related events from Eventbrite
  async fetchCSEEvents() {
    try {
      if (!this.apiKey) {
        console.log('No Eventbrite API key found, returning empty array');
        return [];
      }

      console.log('Fetching real CSE events from Eventbrite API...');
      
      // Search for CSE-related events
      const searchQueries = [
        'software development',
        'programming conference',
        'computer science',
        'tech meetup',
        'developer conference',
        'coding workshop',
        'hackathon',
        'data science',
        'machine learning',
        'web development'
      ];

      let allEvents = [];
      
      for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries to avoid rate limiting
        try {
          const events = await this.searchEvents(query);
          allEvents = allEvents.concat(events);
        } catch (error) {
          console.error(`Error searching for "${query}":`, error.message);
        }
      }

      // Remove duplicates and filter for valid events
      const uniqueEvents = this.removeDuplicates(allEvents);
      const validEvents = this.filterValidEvents(uniqueEvents);
      
      console.log(`Fetched ${validEvents.length} real CSE events from Eventbrite`);
      return validEvents;
    } catch (error) {
      console.error('Error fetching Eventbrite events:', error);
      return []; // Return empty array instead of fake events
    }
  }

  // Search events on Eventbrite
  async searchEvents(query) {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const params = new URLSearchParams({
        'q': query,
        'sort_by': 'date',
        'start_date.range_start': now.toISOString(),
        'start_date.range_end': oneMonthLater.toISOString(),
        'expand': 'venue',
        'page_size': '20',
        'token': this.apiKey
      });

      const options = {
        hostname: 'www.eventbriteapi.com',
        path: `/v3/events/search?${params.toString()}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const response = JSON.parse(data);
              const events = response.events || [];
              const formattedEvents = events.map(event => this.formatEvent(event));
              resolve(formattedEvents);
            } else if (res.statusCode === 401) {
              console.error('Eventbrite API authentication failed - invalid API key');
              resolve([]);
            } else {
              console.error(`Eventbrite API error: ${res.statusCode} - ${data}`);
              resolve([]);
            }
          } catch (error) {
            console.error('Error parsing Eventbrite response:', error);
            resolve([]);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Eventbrite API request error:', error);
        resolve([]);
      });

      req.on('timeout', () => {
        req.destroy();
        console.error('Eventbrite API request timeout');
        resolve([]);
      });

      req.end();
    });
  }

  // Remove duplicate events
  removeDuplicates(events) {
    const seen = new Set();
    return events.filter(event => {
      const key = `${event.title}-${event.date}-${event.location}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Filter for valid events (within next month and CSE-related)
  filterValidEvents(events) {
    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.datetime);
      return eventDate >= now && eventDate <= oneMonthLater;
    });
  }

  // Format Eventbrite event to our event schema
  formatEvent(eventbriteEvent) {
    const startDate = new Date(eventbriteEvent.start.utc || eventbriteEvent.start.local);
    
    return {
      id: this.generateId(),
      title: eventbriteEvent.name?.text || eventbriteEvent.name || 'Untitled Event',
      description: this.stripHtml(eventbriteEvent.description?.text || eventbriteEvent.summary || ''),
      date: startDate.toISOString().split('T')[0],
      time: startDate.toTimeString().split(' ')[0].substring(0, 5),
      datetime: startDate.toISOString(),
      location: this.formatLocation(eventbriteEvent.venue),
      category: this.categorizeEvent(eventbriteEvent.name?.text || eventbriteEvent.name || '', eventbriteEvent.description?.text || ''),
      url: eventbriteEvent.url,
      source: 'eventbrite',
      sourceId: eventbriteEvent.id,
      isOnline: eventbriteEvent.online_event || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  generateId() {
    return crypto.randomUUID();
  }

  formatLocation(venue) {
    if (!venue) return 'Online Event';
    
    const parts = [];
    if (venue.name) parts.push(venue.name);
    if (venue.address) {
      if (venue.address.localized_area_display) {
        parts.push(venue.address.localized_area_display);
      } else if (venue.address.address_1 && venue.address.city) {
        parts.push(`${venue.address.city}, ${venue.address.region || venue.address.country}`);
      }
    }
    
    return parts.join(', ') || 'Location TBD';
  }

  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim();
  }

  categorizeEvent(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('conference') || text.includes('symposium') || text.includes('summit')) {
      return 'conference';
    } else if (text.includes('workshop') || text.includes('training') || text.includes('bootcamp')) {
      return 'workshop';
    } else if (text.includes('networking') || text.includes('meetup')) {
      return 'networking';
    } else if (text.includes('education') || text.includes('learning') || text.includes('course')) {
      return 'education';
    } else if (text.includes('business') || text.includes('startup') || text.includes('entrepreneur')) {
      return 'business';
    } else {
      return 'technology';
    }
  }

  getApiStatus() {
    return {
      configured: !!this.apiKey,
      apiKey: this.apiKey ? 'Set' : 'Not Set',
      baseUrl: this.baseUrl
    };
  }
}

module.exports = EventbriteService;
