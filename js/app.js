class EventSchedulerApp {
    constructor() {
        this.scheduler = new EventScheduler();
        this.init();
    }

    init() {
        this.loadSampleEvents();
        this.setupEventListeners();
        this.renderEvents();
        this.updateStats();
    }

    loadSampleEvents() {
        const sampleEvents = [
            {
                title: "International University Programming Contest (IUPC)",
                dateTime: "2025-07-15T10:00",
                location: "NSU Auditorium",
                description: "Annual programming contest for university students",
                source: "Facebook"
            },
            {
                title: "Tech Summit 2025",
                dateTime: "2025-07-01T09:00",
                location: "BUET Campus",
                description: "Technology summit featuring industry leaders",
                source: "Website"
            },
            {
                title: "AI/ML Seminar",
                dateTime: "2025-06-28T14:00",
                location: "DIU Auditorium",
                description: "Seminar on Artificial Intelligence and Machine Learning",
                source: "Email"
            },
            {
                title: "Coding Bootcamp",
                dateTime: "2025-06-25T10:00",
                location: "Online",
                description: "Intensive coding bootcamp for beginners",
                source: "Facebook"
            }
        ];

        sampleEvents.forEach(eventData => {
            this.scheduler.addEvent(eventData);
        });
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const eventForm = document.getElementById('eventForm');

        // Search functionality with debouncing
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const results = this.scheduler.search(e.target.value);
                this.renderFilteredEvents(results);
            }, 300);
        });

        // Sort functionality
        sortSelect.addEventListener('change', (e) => {
            this.scheduler.sortEvents(e.target.value);
            this.renderEvents();
        });

        // Form submission
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddEvent(e);
        });
    }

    handleAddEvent(e) {
        const eventData = {
            title: document.getElementById('eventTitle').value,
            dateTime: document.getElementById('eventDateTime').value,
            location: document.getElementById('eventLocation').value,
            description: document.getElementById('eventDescription').value,
            source: document.getElementById('eventSource').value
        };
        
        this.scheduler.addEvent(eventData);
        this.renderEvents();
        this.updateStats();
        this.closeAddEventModal();
        e.target.reset();
        
        // Show success message
        this.showNotification('Event added successfully!', 'success');
    }

    renderEvents() {
        const grid = document.getElementById('eventsGrid');
        const events = this.scheduler.events;
        
        if (events.length === 0) {
            grid.innerHTML = `
                <div class="no-events">
                    <h3>No events found</h3>
                    <p>Add some events to get started!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = events.map(event => this.createEventCard(event)).join('');
    }

    renderFilteredEvents(events) {
        const grid = document.getElementById('eventsGrid');
        
        if (events.length === 0) {
            grid.innerHTML = `
                <div class="no-events">
                    <h3>No events found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = events.map(event => this.createEventCard(event)).join('');
    }

    createEventCard(event) {
        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-title">${event.title}</div>
                <div class="event-details">
                    <div class="event-detail">
                        <span class="event-icon">📅</span>
                        <span>${this.scheduler.formatDate(event.date)}</span>
                    </div>
                    <div class="event-detail">
                        <span class="event-icon">📍</span>
                        <span>${event.location}</span>
                    </div>
                    <div class="event-detail">
                        <span class="event-icon">📝</span>
                        <span>${event.description}</span>
                    </div>
                </div>
                <div class="event-source">${event.source}</div>
            </div>
        `;
    }

    updateStats() {
        const stats = this.scheduler.getStats();
        
        document.getElementById('totalEvents').textContent = stats.total;
        document.getElementById('upcomingEvents').textContent = stats.upcoming;
        document.getElementById('todayEvents').textContent = stats.today;
    }

    openAddEventModal() {
        document.getElementById('addEventModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeAddEventModal() {
        document.getElementById('addEventModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    fetchEvents() {
        const loading = document.getElementById('loading');
        loading.style.display = 'block';
        
        // Simulate API call
        setTimeout(() => {
            loading.style.display = 'none';
            this.showNotification('Events refreshed successfully!', 'success');
            console.log('Fetching events from external sources...');
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: '600',
            zIndex: '9999',
            animation: 'slideInRight 0.3s ease',
            backgroundColor: type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'
        });

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions
function openAddEventModal() {
    app.openAddEventModal();
}

function closeAddEventModal() {
    app.closeAddEventModal();
}

function fetchEvents() {
    app.fetchEvents();
}

// Initialize the application
const app = new EventSchedulerApp();

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('addEventModal');
    if (e.target === modal) {
        closeAddEventModal();
    }
});

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);