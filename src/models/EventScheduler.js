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
    
    // Refresh search index and cache if they exist
    if (this.searchIndex) {
      this.refreshSearchIndex();
    }
    if (this.searchableCache) {
      this.refreshSearchableCache();
    }
    
    // Refresh searchable cache
    this.refreshSearchableCache();
    
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
    
    // Refresh search index and cache if they exist
    if (this.searchIndex) {
      this.refreshSearchIndex();
    }
    if (this.searchableCache) {
      this.refreshSearchableCache();
    }
    
    // Refresh searchable cache
    this.refreshSearchableCache();
    
    return updatedEvent;
  }

  // Delete an event
  deleteEvent(id) {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) {
      throw new Error('Event not found');
    }

    const deletedEvent = this.events.splice(index, 1)[0];
    
    // Refresh search index if it exists
    if (this.searchIndex) {
      this.refreshSearchIndex();
    }
    
    // Refresh searchable cache
    this.refreshSearchableCache();
    
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

  // Search events (enhanced with advanced search capabilities)
  searchEvents(query, options = {}) {
    // If it's a simple string query, use optimized basic search
    if (typeof query === 'string') {
      return this.optimizedBasicSearch(query);
    }
    
    // If it's an object with search criteria, use advanced search
    return this.advancedSearch(query);
  }

  // Optimized basic search with better performance
  optimizedBasicSearch(query) {
    if (!query || query.length === 0) return [...this.events];
    
    const searchTerm = query.toLowerCase();
    const results = [];
    
    // Pre-compile regex for better performance with repeated searches
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    
    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i];
      
      // Create a searchable string once per event (more efficient than multiple includes)
      const searchableContent = `${event.title} ${event.description} ${event.location} ${event.category}`;
      
      if (regex.test(searchableContent)) {
        results.push(event);
      }
    }
    
    return results;
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
    
    // Refresh search index if it exists
    if (this.searchIndex) {
      this.refreshSearchIndex();
    }
    
    // Refresh searchable cache
    this.refreshSearchableCache();
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

  // Advanced search with multiple criteria and fuzzy matching
  advancedSearch(searchCriteria) {
    const {
      query = '',
      category = '',
      dateFrom = '',
      dateTo = '',
      location = '',
      fuzzy = false,
      sortBy = 'date',
      sortOrder = 'asc'
    } = searchCriteria;

    let results = [...this.events];

    // Text search with fuzzy matching support
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(event => {
        const searchableText = [
          event.title,
          event.description,
          event.location,
          event.category
        ].join(' ').toLowerCase();

        if (fuzzy) {
          return this.fuzzyMatch(searchableText, searchTerm);
        } else {
          return searchableText.includes(searchTerm);
        }
      });
    }

    // Category filter
    if (category) {
      results = results.filter(event => 
        event.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Location filter
    if (location) {
      results = results.filter(event => 
        event.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Date range filter
    if (dateFrom || dateTo) {
      results = results.filter(event => {
        const eventDate = new Date(event.datetime || event.date);
        const fromDate = dateFrom ? new Date(dateFrom) : new Date('1900-01-01');
        const toDate = dateTo ? new Date(dateTo) : new Date('2100-01-01');
        return eventDate >= fromDate && eventDate <= toDate;
      });
    }

    // Sort results
    results = this.sortEvents(results, sortBy, sortOrder);

    return results;
  }

  // Fuzzy string matching using Levenshtein distance
  fuzzyMatch(text, pattern, threshold = 0.6) {
    const words = pattern.split(' ');
    return words.some(word => {
      if (word.length < 3) return text.includes(word);
      
      const textWords = text.split(' ');
      return textWords.some(textWord => {
        const similarity = this.calculateSimilarity(textWord, word);
        return similarity >= threshold;
      });
    });
  }

  // Calculate string similarity using Levenshtein distance
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
  }

  // Enhanced sort with multiple criteria
  sortEvents(events = this.events, sortBy = 'date', sortOrder = 'asc') {
    const sortedEvents = [...events];
    
    switch (sortBy) {
      case 'date':
        return this.mergeSort(sortedEvents, (a, b) => {
          const dateA = new Date(a.datetime || a.date);
          const dateB = new Date(b.datetime || b.date);
          const result = dateA - dateB;
          return sortOrder === 'asc' ? result : -result;
        });

      case 'title':
        return this.mergeSort(sortedEvents, (a, b) => {
          const result = a.title.localeCompare(b.title);
          return sortOrder === 'asc' ? result : -result;
        });

      case 'category':
        return this.mergeSort(sortedEvents, (a, b) => {
          const result = a.category.localeCompare(b.category);
          return sortOrder === 'asc' ? result : -result;
        });

      case 'location':
        return this.mergeSort(sortedEvents, (a, b) => {
          const result = a.location.localeCompare(b.location);
          return sortOrder === 'asc' ? result : -result;
        });

      case 'created':
        return this.mergeSort(sortedEvents, (a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          const result = dateA - dateB;
          return sortOrder === 'asc' ? result : -result;
        });

      default:
        return sortedEvents;
    }
  }

  // Merge Sort implementation for efficient O(n log n) sorting
  mergeSort(arr, compareFn) {
    if (arr.length <= 1) return arr;

    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    return this.merge(
      this.mergeSort(left, compareFn),
      this.mergeSort(right, compareFn),
      compareFn
    );
  }

  // Merge function for merge sort
  merge(left, right, compareFn) {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < left.length && rightIndex < right.length) {
      if (compareFn(left[leftIndex], right[rightIndex]) <= 0) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }

    return result
      .concat(left.slice(leftIndex))
      .concat(right.slice(rightIndex));
  }

  // Binary search for events by date (requires sorted array)
  binarySearchByDate(targetDate, sortedEvents = null) {
    const events = sortedEvents || this.sortEvents(this.events, 'date', 'asc');
    const target = new Date(targetDate);
    
    let left = 0;
    let right = events.length - 1;
    const results = [];

    // Find the first occurrence
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midDate = new Date(events[mid].datetime || events[mid].date);
      
      if (midDate.toDateString() === target.toDateString()) {
        // Found a match, collect all events on this date
        let i = mid;
        while (i >= 0 && new Date(events[i].datetime || events[i].date).toDateString() === target.toDateString()) {
          results.unshift(events[i]);
          i--;
        }
        i = mid + 1;
        while (i < events.length && new Date(events[i].datetime || events[i].date).toDateString() === target.toDateString()) {
          results.push(events[i]);
          i++;
        }
        break;
      } else if (midDate < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return results;
  }

  // Quick search with indexing for better performance
  createSearchIndex() {
    this.searchIndex = {
      titles: new Map(),
      categories: new Map(),
      locations: new Map(),
      dates: new Map()
    };

    this.events.forEach((event, index) => {
      // Index titles
      const titleWords = event.title.toLowerCase().split(' ');
      titleWords.forEach(word => {
        if (!this.searchIndex.titles.has(word)) {
          this.searchIndex.titles.set(word, []);
        }
        this.searchIndex.titles.get(word).push(index);
      });

      // Index categories
      const category = event.category.toLowerCase();
      if (!this.searchIndex.categories.has(category)) {
        this.searchIndex.categories.set(category, []);
      }
      this.searchIndex.categories.get(category).push(index);

      // Index locations
      if (event.location) {
        const locationWords = event.location.toLowerCase().split(' ');
        locationWords.forEach(word => {
          if (!this.searchIndex.locations.has(word)) {
            this.searchIndex.locations.set(word, []);
          }
          this.searchIndex.locations.get(word).push(index);
        });
      }

      // Index dates
      const eventDate = new Date(event.datetime || event.date);
      const dateKey = eventDate.toDateString();
      if (!this.searchIndex.dates.has(dateKey)) {
        this.searchIndex.dates.set(dateKey, []);
      }
      this.searchIndex.dates.get(dateKey).push(index);
    });
  }

  // Fast indexed search
  indexedSearch(query, type = 'title') {
    if (!this.searchIndex) {
      this.createSearchIndex();
    }

    const searchTerm = query.toLowerCase();
    let eventIndices = new Set();

    switch (type) {
      case 'title':
        if (this.searchIndex.titles.has(searchTerm)) {
          this.searchIndex.titles.get(searchTerm).forEach(index => eventIndices.add(index));
        }
        break;
      
      case 'category':
        if (this.searchIndex.categories.has(searchTerm)) {
          this.searchIndex.categories.get(searchTerm).forEach(index => eventIndices.add(index));
        }
        break;
      
      case 'location':
        if (this.searchIndex.locations.has(searchTerm)) {
          this.searchIndex.locations.get(searchTerm).forEach(index => eventIndices.add(index));
        }
        break;
      
      case 'date':
        const targetDate = new Date(searchTerm);
        const dateKey = targetDate.toDateString();
        if (this.searchIndex.dates.has(dateKey)) {
          this.searchIndex.dates.get(dateKey).forEach(index => eventIndices.add(index));
        }
        break;
    }

    return Array.from(eventIndices).map(index => this.events[index]);
  }

  // Autocomplete suggestions
  getAutocompleteSuggestions(query, limit = 10) {
    if (!this.searchIndex) {
      this.createSearchIndex();
    }

    const searchTerm = query.toLowerCase();
    const suggestions = new Set();

    // Search in titles
    this.searchIndex.titles.forEach((indices, word) => {
      if (word.startsWith(searchTerm) && suggestions.size < limit) {
        suggestions.add(word);
      }
    });

    // Search in categories
    this.searchIndex.categories.forEach((indices, category) => {
      if (category.startsWith(searchTerm) && suggestions.size < limit) {
        suggestions.add(category);
      }
    });

    // Search in locations
    this.searchIndex.locations.forEach((indices, location) => {
      if (location.startsWith(searchTerm) && suggestions.size < limit) {
        suggestions.add(location);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Multi-field search with ranking
  rankedSearch(query, weights = { title: 3, description: 2, location: 1, category: 1 }) {
    const searchTerm = query.toLowerCase();
    const results = [];

    this.events.forEach(event => {
      let score = 0;
      
      // Title matching
      if (event.title.toLowerCase().includes(searchTerm)) {
        score += weights.title;
      }
      
      // Description matching
      if (event.description.toLowerCase().includes(searchTerm)) {
        score += weights.description;
      }
      
      // Location matching
      if (event.location.toLowerCase().includes(searchTerm)) {
        score += weights.location;
      }
      
      // Category matching
      if (event.category.toLowerCase().includes(searchTerm)) {
        score += weights.category;
      }

      if (score > 0) {
        results.push({ event, score });
      }
    });

    // Sort by relevance score
    return results
      .sort((a, b) => b.score - a.score)
      .map(result => result.event);
  }

  // Update search index when events change
  refreshSearchIndex() {
    this.searchIndex = null;
    this.createSearchIndex();
  }

  // Cache searchable content for ultra-fast searching
  createSearchableCache() {
    this.searchableCache = this.events.map(event => ({
      event,
      searchableText: `${event.title} ${event.description} ${event.location} ${event.category}`.toLowerCase()
    }));
  }

  // Ultra-fast cached search
  cachedSearch(query) {
    if (!this.searchableCache) {
      this.createSearchableCache();
    }
    
    if (!query || query.length === 0) return this.events.slice();
    
    const searchTerm = query.toLowerCase();
    const results = [];
    
    for (let i = 0; i < this.searchableCache.length; i++) {
      const cached = this.searchableCache[i];
      if (cached.searchableText.includes(searchTerm)) {
        results.push(cached.event);
      }
    }
    
    return results;
  }

  // Refresh searchable cache when events change
  refreshSearchableCache() {
    this.searchableCache = null;
  }
}

module.exports = EventScheduler;