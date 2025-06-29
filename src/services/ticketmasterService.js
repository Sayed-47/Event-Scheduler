const crypto = require('crypto');

class TicketmasterService {
  constructor() {
    this.apiKey = process.env.TICKETMASTER_API_KEY;
    this.baseUrl = 'https://app.ticketmaster.com/discovery/v2';
  }

  // Fetch CSE-related events from Ticketmaster
  async fetchCSEEvents() {
    try {
      // Since we don't have real API access, we'll return mock data
      // In a real implementation, you would make actual API calls
      const mockEvents = this.getMockTicketmasterEvents();
      
      // Format events to match our schema
      const formattedEvents = mockEvents.map(event => this.formatEvent(event));
      
      console.log(`Fetched ${formattedEvents.length} CSE events from Ticketmaster`);
      return formattedEvents;
    } catch (error) {
      console.error('Error fetching Ticketmaster events:', error);
      throw error;
    }
  }

  // Format Ticketmaster event to our event schema
  formatEvent(ticketmasterEvent) {
    const eventDate = new Date(ticketmasterEvent.dates.start.dateTime);
    
    return {
      id: this.generateId(),
      title: ticketmasterEvent.name,
      description: this.cleanDescription(ticketmasterEvent.info || ticketmasterEvent.pleaseNote || ''),
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

  // Mock Ticketmaster events data
  getMockTicketmasterEvents() {
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
    const futureDate2 = new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000); // 18 days from now
    const futureDate3 = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000); // 25 days from now
    const futureDate4 = new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000); // 32 days from now

    return [
      {
        id: 'tm_001',
        name: 'TechCrunch Disrupt 2024: Innovation Summit',
        info: 'The premier technology conference featuring cutting-edge startups, industry leaders, and breakthrough innovations in computer science and engineering.',
        url: 'https://ticketmaster.com/techcrunch-disrupt-001',
        dates: {
          start: {
            dateTime: futureDate1.toISOString()
          },
          status: {
            code: 'onsale'
          }
        },
        classifications: [
          {
            segment: {
              name: 'Arts & Theatre'
            },
            genre: {
              name: 'Technology'
            }
          }
        ],
        priceRanges: [
          {
            min: 299,
            max: 899,
            currency: 'USD'
          }
        ],
        _embedded: {
          venues: [
            {
              name: 'Moscone Center',
              city: {
                name: 'San Francisco'
              },
              state: {
                name: 'CA'
              },
              address: {
                line1: '747 Howard St'
              }
            }
          ]
        },
        promoter: {
          id: 'prom_001'
        }
      },
      {
        id: 'tm_002',
        name: 'AI & Machine Learning Expo 2024',
        info: 'Explore the latest advances in artificial intelligence and machine learning with hands-on workshops and expert presentations.',
        url: 'https://ticketmaster.com/ai-ml-expo-002',
        dates: {
          start: {
            dateTime: futureDate2.toISOString()
          },
          status: {
            code: 'onsale'
          }
        },
        classifications: [
          {
            segment: {
              name: 'Arts & Theatre'
            },
            genre: {
              name: 'Educational'
            }
          }
        ],
        priceRanges: [
          {
            min: 150,
            max: 450,
            currency: 'USD'
          }
        ],
        _embedded: {
          venues: [
            {
              name: 'Boston Convention Center',
              city: {
                name: 'Boston'
              },
              state: {
                name: 'MA'
              },
              address: {
                line1: '415 Summer St'
              }
            }
          ]
        },
        promoter: {
          id: 'prom_002'
        }
      },
      {
        id: 'tm_003',
        name: 'Cybersecurity Career Fair & Workshop',
        pleaseNote: 'Connect with top cybersecurity employers and attend practical workshops on penetration testing, threat analysis, and security architecture.',
        url: 'https://ticketmaster.com/cybersec-fair-003',
        dates: {
          start: {
            dateTime: futureDate3.toISOString()
          },
          status: {
            code: 'onsale'
          }
        },
        classifications: [
          {
            segment: {
              name: 'Miscellaneous'
            },
            genre: {
              name: 'Career'
            }
          }
        ],
        priceRanges: [
          {
            min: 0,
            max: 0,
            currency: 'USD'
          }
        ],
        _embedded: {
          venues: [
            {
              name: 'Austin Convention Center',
              city: {
                name: 'Austin'
              },
              state: {
                name: 'TX'
              },
              address: {
                line1: '500 E Cesar Chavez St'
              }
            }
          ]
        },
        promoter: {
          id: 'prom_003'
        }
      },
      {
        id: 'tm_004',
        name: 'Open Source Software Summit',
        info: 'Join the open source community for talks, workshops, and collaboration opportunities. Perfect for developers and computer science students.',
        url: 'https://ticketmaster.com/oss-summit-004',
        dates: {
          start: {
            dateTime: futureDate4.toISOString()
          },
          status: {
            code: 'onsale'
          }
        },
        classifications: [
          {
            segment: {
              name: 'Arts & Theatre'
            },
            genre: {
              name: 'Technology'
            }
          }
        ],
        priceRanges: [
          {
            min: 50,
            max: 200,
            currency: 'USD'
          }
        ],
        _embedded: {
          venues: [
            {
              name: 'Oregon Convention Center',
              city: {
                name: 'Portland'
              },
              state: {
                name: 'OR'
              },
              address: {
                line1: '777 NE Martin Luther King Jr Blvd'
              }
            }
          ]
        },
        promoter: {
          id: 'prom_004'
        }
      },
      {
        id: 'tm_005',
        name: 'Women in Tech Leadership Conference',
        info: 'Empowering women in technology with leadership workshops, networking opportunities, and inspiring keynote speakers from top tech companies.',
        url: 'https://ticketmaster.com/women-tech-005',
        dates: {
          start: {
            dateTime: new Date(futureDate2.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          status: {
            code: 'onsale'
          }
        },
        classifications: [
          {
            segment: {
              name: 'Arts & Theatre'
            },
            genre: {
              name: 'Conference'
            }
          }
        ],
        priceRanges: [
          {
            min: 100,
            max: 350,
            currency: 'USD'
          }
        ],
        _embedded: {
          venues: [
            {
              name: 'Chicago Convention Center',
              city: {
                name: 'Chicago'
              },
              state: {
                name: 'IL'
              },
              address: {
                line1: '2301 S King Dr'
              }
            }
          ]
        },
        promoter: {
          id: 'prom_005'
        }
      }
    ];
  }

  // Search for events with specific criteria
  async searchEvents(query, location = null, dateRange = null) {
    try {
      const allEvents = await this.fetchCSEEvents();
      
      if (query) {
        const searchTerm = query.toLowerCase();
        return allEvents.filter(event =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm)
        );
      }
      
      return allEvents;
    } catch (error) {
      console.error('Error searching Ticketmaster events:', error);
      throw error;
    }
  }

  // Get event details by ID
  async getEventDetails(eventId) {
    try {
      const allEvents = await this.fetchCSEEvents();
      return allEvents.find(event => event.sourceId === eventId);
    } catch (error) {
      console.error('Error getting Ticketmaster event details:', error);
      throw error;
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

  // Validate event data from Ticketmaster
  validateEventData(event) {
    const errors = [];

    if (!event.name) {
      errors.push('Event name is required');
    }

    if (!event.dates || !event.dates.start || !event.dates.start.dateTime) {
      errors.push('Event start time is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get events by category
  async getEventsByCategory(category) {
    try {
      const allEvents = await this.fetchCSEEvents();
      return allEvents.filter(event => event.category === category);
    } catch (error) {
      console.error('Error getting events by category:', error);
      throw error;
    }
  }

  // Get events by price range
  async getEventsByPriceRange(minPrice, maxPrice) {
    try {
      const allEvents = await this.fetchCSEEvents();
      return allEvents.filter(event => {
        if (!event.priceRange) return false;
        
        const priceText = event.priceRange.replace(/[$,]/g, '');
        const prices = priceText.split(' - ').map(p => parseFloat(p));
        
        if (prices.length === 1) {
          return prices[0] >= minPrice && prices[0] <= maxPrice;
        } else if (prices.length === 2) {
          return prices[0] >= minPrice && prices[1] <= maxPrice;
        }
        
        return false;
      });
    } catch (error) {
      console.error('Error getting events by price range:', error);
      throw error;
    }
  }
}

module.exports = TicketmasterService;
