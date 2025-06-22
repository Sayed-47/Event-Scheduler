class EventScheduler {
    constructor() {
        this.events = [];
        this.hashTable = new Map(); // For O(1) lookups
        this.bst = new BST(); // For sorted operations
    }

    // Hash Table for fast lookups - O(1) average case
    addToHashTable(event) {
        const key = event.title.toLowerCase();
        if (!this.hashTable.has(key)) {
            this.hashTable.set(key, []);
        }
        this.hashTable.get(key).push(event);
    }

    // Binary Search Tree for efficient sorting - O(log n) insertions
    addToBST(event) {
        this.bst.insert(event);
    }

    // Quick Sort implementation - O(n log n) average case
    quickSort(arr, key, ascending = true) {
        if (arr.length <= 1) return arr;
        
        const pivot = arr[Math.floor(arr.length / 2)];
        const left = [];
        const right = [];
        const equal = [];

        for (let element of arr) {
            const comparison = this.compareValues(element[key], pivot[key]);
            if (comparison < 0) {
                ascending ? left.push(element) : right.push(element);
            } else if (comparison > 0) {
                ascending ? right.push(element) : left.push(element);
            } else {
                equal.push(element);
            }
        }

        return [
            ...this.quickSort(left, key, ascending),
            ...equal,
            ...this.quickSort(right, key, ascending)
        ];
    }

    compareValues(a, b) {
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() - b.getTime();
        }
        if (typeof a === 'string' && typeof b === 'string') {
            return a.localeCompare(b);
        }
        return a - b;
    }

    // Binary Search for finding events - O(log n)
    binarySearch(arr, target, key) {
        let left = 0;
        let right = arr.length - 1;
        const results = [];

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midValue = arr[mid][key].toString().toLowerCase();
            const targetValue = target.toLowerCase();

            if (midValue.includes(targetValue)) {
                results.push(arr[mid]);
                // Search for more matches around this position
                let i = mid - 1;
                while (i >= 0 && arr[i][key].toString().toLowerCase().includes(targetValue)) {
                    results.unshift(arr[i]);
                    i--;
                }
                i = mid + 1;
                while (i < arr.length && arr[i][key].toString().toLowerCase().includes(targetValue)) {
                    results.push(arr[i]);
                    i++;
                }
                break;
            } else if (midValue < targetValue) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return results;
    }

    // Advanced search with multiple criteria
    search(query) {
        if (!query.trim()) return this.events;

        const results = new Set();
        const searchTerm = query.toLowerCase();

        // Search in multiple fields
        this.events.forEach(event => {
            const searchableText = [
                event.title,
                event.location,
                event.description,
                event.source
            ].join(' ').toLowerCase();

            if (searchableText.includes(searchTerm)) {
                results.add(event);
            }
        });

        return Array.from(results);
    }

    addEvent(eventData) {
        const event = {
            id: Date.now(),
            title: eventData.title,
            date: new Date(eventData.dateTime),
            location: eventData.location,
            description: eventData.description,
            source: eventData.source,
            createdAt: new Date()
        };

        this.events.push(event);
        this.addToHashTable(event);
        this.addToBST(event);
        return event;
    }

    deleteEvent(eventId) {
        this.events = this.events.filter(event => event.id !== eventId);
        // Rebuild hash table and BST
        this.hashTable.clear();
        this.bst = new BST();
        this.events.forEach(event => {
            this.addToHashTable(event);
            this.addToBST(event);
        });
    }

    sortEvents(key) {
        this.events = this.quickSort(this.events, key);
        return this.events;
    }

    getEventsByDateRange(startDate, endDate) {
        return this.events.filter(event => 
            event.date >= startDate && event.date <= endDate
        );
    }

    getUpcomingEvents() {
        const now = new Date();
        return this.events.filter(event => event.date >= now);
    }

    getTodayEvents() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        
        return this.events.filter(event => 
            event.date >= today && event.date < tomorrow
        );
    }

    getStats() {
        const upcoming = this.getUpcomingEvents().length;
        const today = this.getTodayEvents().length;
        
        return {
            total: this.events.length,
            upcoming,
            today
        };
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}