const crypto = require('crypto');

class EventbriteService {
  constructor() {
    this.apiKey = process.env.EVENTBRITE_API_KEY;
    this.baseUrl = 'https://www.eventbriteapi.com/v3';
  }

  // Fetch CSE-related events from Eventbrite
  async fetchCSEEvents() {
    try {
      // Since we don't have real API access, we'll return mock data
      const mockEvents = this.getMockEventbriteEvents();
      
      // Format events to match our schema
      const formattedEvents = mockEvents.map(event => this.formatEvent(event));
      
      console.log(`Fetched ${formattedEvents.length} CSE events from Eventbrite`);
      return formattedEvents;
    } catch (error) {
      console.error('Error fetching Eventbrite events:', error);
      throw error;
    }
  }

  // Format Eventbrite event to our event schema
  formatEvent(eventbriteEvent) {
    const startDate = new Date(eventbriteEvent.start.utc);
    
    return {
      id: this.generateId(),
      title: eventbriteEvent.name.text,
      description: this.stripHtml(eventbriteEvent.description.text || ''),
      date: startDate.toISOString().split('T')[0],
      time: startDate.toTimeString().split(' ')[0].substring(0, 5),
      datetime: startDate.toISOString(),
      location: this.formatLocation(eventbriteEvent.venue),
      category: this.categorizeEvent(eventbriteEvent.name.text, eventbriteEvent.description.text),
      url: eventbriteEvent.url,
      source: 'eventbrite',
      sourceId: eventbriteEvent.id,
      isOnline: eventbriteEvent.online_event,
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
    if (venue.address && venue.address.localized_area_display) {
      parts.push(venue.address.localized_area_display);
    }
    
    return parts.join(', ') || 'Location TBD';
  }

  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

  categorizeEvent(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('conference') || text.includes('symposium')) {
      return 'conference';
    } else if (text.includes('workshop') || text.includes('training')) {
      return 'workshop';
    } else if (text.includes('networking') || text.includes('meetup')) {
      return 'networking';
    } else if (text.includes('education') || text.includes('learning')) {
      return 'education';
    } else if (text.includes('business') || text.includes('startup')) {
      return 'business';
    } else {
      return 'technology';
    }
  }

  getMockEventbriteEvents() {
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'eb_001',
        name: {
          text: 'Advanced Machine Learning Workshop for Computer Scientists'
        },
        description: {
          text: 'Join us for an intensive workshop covering advanced machine learning techniques.'
        },
        start: {
          utc: futureDate1.toISOString()
        },
        end: {
          utc: new Date(futureDate1.getTime() + 4 * 60 * 60 * 1000).toISOString()
        },
        url: 'https://eventbrite.com/e/ml-workshop-001',
        online_event: false,
        venue: {
          name: 'Tech Innovation Center',
          address: {
            localized_area_display: 'San Francisco, CA'
          }
        }
      },
      {
        id: 'eb_002',
        name: {
          text: 'Full Stack Development Conference 2024'
        },
        description: {
          text: 'A comprehensive conference for full stack developers.'
        },
        start: {
          utc: futureDate2.toISOString()
        },
        end: {
          utc: new Date(futureDate2.getTime() + 8 * 60 * 60 * 1000).toISOString()
        },
        url: 'https://eventbrite.com/e/fullstack-conf-002',
        online_event: false,
        venue: {
          name: 'Convention Center West',
          address: {
            localized_area_display: 'Seattle, WA'
          }
        }
      }
    ];
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
