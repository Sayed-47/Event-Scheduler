import BST from './BST.js';

class EventScheduler {
    constructor() {
        this.events = [];
        this.eventHashTable = new Map();
        this.bst = new BST();
        this.nextId = 1;
    }

    addEvent(eventData) {
        const event = {
            id: this.nextId++,
            title: eventData.title,
            date: new Date(eventData.dateTime || eventData.date),
            location: eventData.location,
            description: eventData.description || 'No description provided',
            source: eventData.source,
            createdAt: new Date()
        };

        this.events.push(event);
        this.addToHashTable(event);
        this.addToBST(event);

        return event;
    }

    addToHashTable(event) {
        this.eventHashTable.set(event.id, event);
    }

    addToBST(event) {
        this.bst.insert(event);
    }

    deleteEvent(eventId) {
        const event = this.eventHashTable.get(eventId);
        if (!event) return false;

        this.events = this.events.filter(e => e.id !== eventId);
        this.eventHashTable.delete(eventId);
        this.bst.delete(event);

        return true;
    }

    getEventById(id) {
        return this.eventHashTable.get(id);
    }

    getEventsByDate(date) {
        return this.bst.search(date);
    }

    getEventsInDateRange(startDate, endDate) {
        return this.bst.getEventsInRange(startDate, endDate);
    }

    search(query) {
        if (!query.trim()) return this.events;

        const searchTerm = query.toLowerCase();
        return this.events.filter(event => 
            event.title.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.source.toLowerCase().includes(searchTerm)
        );
    }

    sortEvents(criteria) {
        switch (criteria) {
            case 'date':
                this.events.sort((a, b) => a.date - b.date);
                break;
            case 'title':
                this.events.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'location':
                this.events.sort((a, b) => a.location.localeCompare(b.location));
                break;
            case 'source':
                this.events.sort((a, b) => a.source.localeCompare(b.source));
                break;
            default:
                this.events.sort((a, b) => a.date - b.date);
        }
    }

    getUpcomingEvents() {
        const now = new Date();
        return this.events.filter(event => event.date >= now);
    }

    getTodayEvents() {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        
        return this.events.filter(event => 
            event.date >= startOfDay && event.date <= endOfDay
        );
    }

    getStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return {
            total: this.events.length,
            upcoming: this.events.filter(event => event.date >= now).length,
            today: this.events.filter(event => 
                event.date >= today && event.date < tomorrow
            ).length
        };
    }

    formatDate(date) {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    loadEvents(eventsData) {
        this.events = eventsData.events || [];
        this.eventHashTable.clear();
        this.bst = new BST();

        this.events.forEach(event => {
            this.eventHashTable.set(event.id, event);
            this.bst.insert(event);
        });

        if (this.events.length > 0) {
            this.nextId = Math.max(...this.events.map(e => e.id)) + 1;
        }
    }

    getAllEvents() {
        return {
            timestamp: new Date().toISOString(),
            version: "1.0",
            totalEvents: this.events.length,
            events: this.events
        };
    }
}

export default EventScheduler;