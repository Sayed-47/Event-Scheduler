const crypto = require('crypto');
const https = require('https');

class TicketmasterService {
  constructor() {
    this.apiKey = process.env.TICKETMASTER_API_KEY;
    this.baseUrl = 'https://app.ticketmaster.com/discovery/v2';
  }

  // Fetch CSE-related events from Ticketmaster
  async fetchCSEEvents() {
    try {
      if (!this.apiKey) {
        console.log('No Ticketmaster API key found, returning empty array');
        return [];
      }

      console.log('Fetching real CSE events from Ticketmaster API...');
      
      // Search for CSE-related events with broader terms
      const searchQueries = [
        'technology',
        'tech',
        'digital',
        'innovation',
        'conference',
        'summit'
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
      
      console.log(`Fetched ${validEvents.length} real CSE events from Ticketmaster`);
      return validEvents;
    } catch (error) {
      console.error('Error fetching Ticketmaster events:', error);
      return []; // Return empty array instead of fake events
    }
  }

  // Check if event is tech/CSE related
  isTechRelated(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const cseKeywords = [
      'tech', 'technology', 'digital', 'innovation', 'software', 'programming', 
      'coding', 'developer', 'computer', 'data', 'artificial intelligence', 
      'machine learning', 'cybersecurity', 'conference', 'summit', 'blockchain',
      'cloud', 'app', 'web', 'mobile', 'startup', 'engineering'
    ];
    
    // Exclude obvious non-tech events
    const excludeKeywords = [
      'drag racing', 'soccer', 'football', 'basketball', 'baseball', 'hockey',
      'concert tour', 'music festival', 'band concert', 'singer performance'
    ];
    
    // Check for exclusions first
    const hasStrongExclusion = excludeKeywords.some(keyword => text.includes(keyword));
    if (hasStrongExclusion) {
      return false;
    }
    
    // Check for tech keywords
    return cseKeywords.some(keyword => text.includes(keyword));
  }

  // Search events on Ticketmaster
  async searchEvents(query) {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const params = new URLSearchParams({
        'keyword': query,
        'sort': 'date,asc',
        'startDateTime': now.toISOString().split('.')[0] + 'Z',
        'endDateTime': oneMonthLater.toISOString().split('.')[0] + 'Z',
        'size': '50', // Increased to get more results for filtering
        'apikey': this.apiKey
      });

      const options = {
        hostname: 'app.ticketmaster.com',
        path: `/discovery/v2/events.json?${params.toString()}`,
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
              const events = response._embedded?.events || [];
              const formattedEvents = events.map(event => this.formatEvent(event));
              resolve(formattedEvents);
            } else if (res.statusCode === 401) {
              console.error('Ticketmaster API authentication failed - invalid API key');
              resolve([]);
            } else {
              console.error(`Ticketmaster API error: ${res.statusCode} - ${data}`);
              resolve([]);
            }
          } catch (error) {
            console.error('Error parsing Ticketmaster response:', error);
            resolve([]);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Ticketmaster API request error:', error);
        resolve([]);
      });

      req.on('timeout', () => {
        req.destroy();
        console.error('Ticketmaster API request timeout');
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

  // Filter for valid events (within next month and tech-related)
  filterValidEvents(events) {
    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.datetime);
      const isTechRelated = this.isTechRelated(event.title, event.description);
      return eventDate >= now && eventDate <= oneMonthLater && isTechRelated;
    });
  }

  // Format Ticketmaster event to our event schema
  formatEvent(ticketmasterEvent) {
    const eventDate = new Date(ticketmasterEvent.dates?.start?.dateTime || ticketmasterEvent.dates?.start?.localDate);
    
    return {
      id: this.generateId(),
      title: ticketmasterEvent.name || 'Untitled Event',
      description: this.cleanDescription(ticketmasterEvent.info || ticketmasterEvent.pleaseNote || ticketmasterEvent.description || ''),
      date: eventDate.toISOString().split('T')[0],
      time: eventDate.toTimeString().split(' ')[0].substring(0, 5),
      datetime: eventDate.toISOString(),
      location: this.formatVenue(ticketmasterEvent._embedded?.venues?.[0]),
      category: this.categorizeEvent(ticketmasterEvent.name, ticketmasterEvent.classifications),
      url: ticketmasterEvent.url,
      source: 'ticketmaster',
      sourceId: ticketmasterEvent.id,
      priceRange: this.formatPriceRange(ticketmasterEvent.priceRanges),
      ticketmasterData: {
        promoterId: ticketmasterEvent.promoter?.id,
        segment: ticketmasterEvent.classifications?.[0]?.segment?.name,
        genre: ticketmasterEvent.classifications?.[0]?.genre?.name,
        status: ticketmasterEvent.dates?.status?.code
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Generate unique ID
  generateId() {
    return crypto.randomUUID();
  }

  // Format venue information
  formatVenue(venue) {
    if (!venue) return 'Venue TBD';
    
    const parts = [];
    if (venue.name) parts.push(venue.name);
    if (venue.city?.name && venue.state?.name) {
      parts.push(`${venue.city.name}, ${venue.state.name}`);
    } else if (venue.address?.line1) {
      parts.push(venue.address.line1);
    }
    
    return parts.join(', ') || 'Location TBD';
  }

  // Clean and format description
  cleanDescription(description) {
    if (!description) return '';
    return description.replace(/\s+/g, ' ').trim().substring(0, 500);
  }

  // Format price range
  formatPriceRange(priceRanges) {
    if (!priceRanges || priceRanges.length === 0) return null;
    
    const range = priceRanges[0];
    if (range.min === range.max) {
      return `$${range.min}`;
    } else {
      return `$${range.min} - $${range.max}`;
    }
  }

  // Categorize event based on name and classifications
  categorizeEvent(name, classifications) {
    const eventName = name.toLowerCase();
    
    // Check classifications first
    if (classifications && classifications.length > 0) {
      const genre = classifications[0].genre?.name?.toLowerCase() || '';
      const segment = classifications[0].segment?.name?.toLowerCase() || '';
      
      if (segment.includes('arts') || segment.includes('theatre')) {
        return 'education';
      }
      if (segment.includes('sports')) {
        return 'networking'; // Sports events often have networking aspects
      }
    }
    
    // Categorize based on event name
    if (eventName.includes('conference') || eventName.includes('summit') || eventName.includes('expo')) {
      return 'conference';
    } else if (eventName.includes('workshop') || eventName.includes('training') || eventName.includes('seminar')) {
      return 'workshop';
    } else if (eventName.includes('networking') || eventName.includes('meetup') || eventName.includes('mixer')) {
      return 'networking';
    } else if (eventName.includes('tech') || eventName.includes('coding') || eventName.includes('programming')) {
      return 'technology';
    } else if (eventName.includes('business') || eventName.includes('entrepreneur') || eventName.includes('startup')) {
      return 'business';
    } else if (eventName.includes('education') || eventName.includes('learning') || eventName.includes('university')) {
      return 'education';
    } else {
      return 'technology'; // Default for CSE-related events
    }
  }

  // Check if API is available and configured
  isConfigured() {
    return !!this.apiKey;
  }

  // Get API status
  getApiStatus() {
    return {
      configured: this.isConfigured(),
      apiKey: this.apiKey ? 'Set' : 'Not Set',
      baseUrl: this.baseUrl
    };
  }
}

module.exports = TicketmasterService;
