class EventSchedulerApp {
    constructor() {
        this.apiBaseUrl = '/api/events';
        this.init();
        this.createFloatingParticles();
    }

    async init() {
        try {
            this.showLoading(true);
            this.setupEventListeners();
            await this.loadEvents();
            this.updateStats();
            this.showNotification('📁 Events loaded successfully!', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('⚠️ Failed to load events from server.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadEvents() {
        try {
            const response = await fetch(this.apiBaseUrl);
            const result = await response.json();
            
            if (result.success) {
                this.events = result.data;
                this.renderEvents();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error loading events:', error);
            this.events = [];
            this.renderEvents();
        }
    }    async addEvent(eventData) {
        console.log('Adding event via API:', eventData);
        try {
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });

            console.log('API response status:', response.status);
            const result = await response.json();
            console.log('API response data:', result);
            
            if (result.success) {
                await this.loadEvents();
                this.updateStats();
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error adding event:', error);
            throw error;
        }
    }

    async deleteEvent(eventId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${eventId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                await this.loadEvents();
                this.updateStats();
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }

    async searchEvents(query, filters = {}) {
        try {
            const params = new URLSearchParams();
            if (query) params.append('search', query);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.source) params.append('source', filters.source);

            const response = await fetch(`${this.apiBaseUrl}?${params}`);
            const result = await response.json();
            
            if (result.success) {
                this.events = result.data;
                this.renderEvents();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error searching events:', error);
        }
    }    async fetchExternalEvents() {
        console.log('fetchExternalEvents called');
        try {
            this.showLoading(true, 'Fetching events from external sources...');
            
            console.log('Making request to /api/fetch-external');
            const response = await fetch('/api/fetch-external');
            console.log('Response status:', response.status);
            
            const result = await response.json();
            console.log('Response data:', result);
            
            if (result.success && result.data.length > 0) {
                let addedCount = 0;
                for (const eventData of result.data) {
                    try {
                        await this.addEvent(eventData);
                        addedCount++;
                    } catch (error) {
                        console.error('Error adding external event:', error);
                    }
                }
                
                this.showNotification(`🚀 Fetched ${addedCount} new events!`, 'success');
            } else {
                this.showNotification('📅 No new events found from external sources!', 'info');
            }
        } catch (error) {
            console.error('Error fetching external events:', error);
            this.showNotification('❌ Failed to fetch external events!', 'error');
        } finally {
            this.showLoading(false);
        }
    }    async exportEvents() {
        console.log('exportEvents called');
        try {
            console.log('Making request to /api/export');
            const response = await fetch('/api/export');
            console.log('Export response status:', response.status);
            console.log('Export response headers:', response.headers);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            console.log('Blob created, size:', blob.size);
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `events_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('📁 Events exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting events:', error);
            this.showNotification('❌ Failed to export events!', 'error');
        }
    }

    async importEvents(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/import', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                await this.loadEvents();
                this.updateStats();
                this.showNotification(`📥 ${result.message}!`, 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error importing events:', error);
            this.showNotification(`❌ Import failed: ${error.message}`, 'error');
        }
    }    setupEventListeners() {
        console.log('Setting up event listeners...');        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const eventForm = document.getElementById('eventForm');
        const addEventBtn = document.querySelector('.btn.btn-primary[onclick="openAddEventModal()"]');
        const fetchExternalBtn = document.querySelector('.btn.btn-secondary[onclick="fetchEvents()"]');
        const exportBtn = document.querySelector('.btn.btn-secondary[onclick="exportEvents()"]');

        console.log('Event form element:', eventForm);
        console.log('Add event button element:', addEventBtn);
        console.log('Fetch external button element:', fetchExternalBtn);
        console.log('Export button element:', exportBtn);

        // Add direct event listener for the Add Event button as backup
        if (addEventBtn) {
            addEventBtn.addEventListener('click', (e) => {
                console.log('Add Event button clicked via event listener');
                e.preventDefault();
                this.openAddEventModal();
            });
        }

        // Add direct event listener for the Fetch External button as backup
        if (fetchExternalBtn) {
            fetchExternalBtn.addEventListener('click', (e) => {
                console.log('Fetch External button clicked via event listener');
                e.preventDefault();
                this.fetchExternalEvents();
            });
        }

        // Add direct event listener for the Export button as backup
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                console.log('Export button clicked via event listener');
                e.preventDefault();
                this.exportEvents();
            });
        }

        // Search functionality
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchInput.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.4)';
            
            searchTimeout = setTimeout(() => {
                this.searchEvents(e.target.value);
                searchInput.style.boxShadow = '';
            }, 300);
        });

        // Sort functionality
        sortSelect.addEventListener('change', (e) => {
            this.searchEvents('', { sort: e.target.value });
        });        // Form submission
        if (eventForm) {
            console.log('Adding submit event listener to form');
            eventForm.addEventListener('submit', (e) => {
                console.log('Form submit event triggered!', e);
                e.preventDefault();
                this.handleAddEvent(e);
            });
        } else {
            console.error('Event form not found!');
        }

        // Delete button listener
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn') || e.target.parentElement.classList.contains('delete-btn')) {
                const eventId = parseInt(e.target.dataset.eventId || e.target.parentElement.dataset.eventId);
                this.handleDeleteEvent(eventId);
            }
        });
    }    async handleAddEvent(e) {
        console.log('handleAddEvent called', e);
        const title = document.getElementById('eventTitle').value.trim();
        const dateTime = document.getElementById('eventDateTime').value;
        const location = document.getElementById('eventLocation').value.trim();
        const description = document.getElementById('eventDescription').value.trim();
        const source = document.getElementById('eventSource').value;

        console.log('Form values:', { title, dateTime, location, description, source });

        if (!title || !dateTime || !location || !source) {
            this.showNotification('Please fill in all required fields! ❌', 'error');
            return;
        }

        const eventDate = new Date(dateTime);
        if (eventDate < new Date()) {
            this.showNotification('Please select a future date and time! ⏰', 'error');
            return;
        }

        try {
            await this.addEvent({
                title,
                dateTime,
                location,
                description: description || 'No description provided',
                source
            });

            this.closeAddEventModal();
            e.target.reset();
            this.showNotification(`Event "${title}" added successfully! ✨`, 'success');
        } catch (error) {
            this.showNotification(`Failed to add event: ${error.message} ❌`, 'error');
        }
    }

    async handleDeleteEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
            try {
                await this.deleteEvent(eventId);
                this.showNotification(`Event "${event.title}" deleted successfully! 🗑️`, 'success');
            } catch (error) {
                this.showNotification(`Failed to delete event: ${error.message} ❌`, 'error');
            }
        }
    }

    async updateStats() {
        try {
            const response = await fetch('/api/events/stats/summary');
            const result = await response.json();
            
            if (result.success) {
                const stats = result.data;
                this.animateNumber('totalEvents', stats.total);
                this.animateNumber('upcomingEvents', stats.upcoming);
                this.animateNumber('todayEvents', stats.today);
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    renderEvents() {
        const grid = document.getElementById('eventsGrid');
        
        if (!this.events || this.events.length === 0) {
            grid.innerHTML = `
                <div class="no-events">
                    <h3>No events found</h3>
                    <p>Add some events or import from a JSON file!</p>
                    <button class="btn btn-primary" onclick="openAddEventModal()" style="margin-top: 1rem;">
                        ✨ Add Your First Event
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.events.map((event, index) => this.createEventCard(event, index)).join('');
        
        setTimeout(() => {
            document.querySelectorAll('.event-card').forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
            });
        }, 50);
    }

    createEventCard(event, index) {
        const colors = ['--accent-blue', '--accent-purple', '--accent-pink'];
        const colorVar = colors[index % colors.length];
        
        const now = new Date();
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate >= now;
        const statusClass = isUpcoming ? 'upcoming' : 'past';
        
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="event-card ${statusClass}" data-event-id="${event.id}" style="--card-color: var(${colorVar})">
                <div class="event-header">
                    <div class="event-title">${event.title}</div>
                    <button class="delete-btn" data-event-id="${event.id}" title="Delete Event">
                        <span>×</span>
                    </button>
                </div>
                <div class="event-details">
                    <div class="event-detail">
                        <span class="event-icon">📅</span>
                        <span>${formattedDate}</span>
                        <span class="event-status">${isUpcoming ? '🟢' : '🔴'}</span>
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
                <div class="event-footer">
                    <div class="event-source">${event.source}</div>
                    <div class="event-id">ID: ${event.id}</div>
                </div>
            </div>
        `;
    }

    showLoading(show, message = 'Loading events...') {
        const loading = document.getElementById('loading');
        if (show) {
            loading.style.display = 'block';
            loading.innerHTML = `
                <div class="spinner"></div>
                <p>${message}</p>
            `;
        } else {
            loading.style.display = 'none';
        }
    }

    createFloatingParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'floating-particles';
        document.body.appendChild(particlesContainer);

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (8 + Math.random() * 4) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((targetValue - currentValue) / 20);
        
        if (currentValue < targetValue) {
            element.textContent = currentValue + increment;
            setTimeout(() => this.animateNumber(elementId, targetValue), 50);
        } else {
            element.textContent = targetValue;
        }
    }    openAddEventModal() {
        console.log('Opening add event modal');
        const modal = document.getElementById('addEventModal');
        console.log('Modal element:', modal);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            const now = new Date();
            const minDateTime = now.toISOString().slice(0, 16);
            document.getElementById('eventDateTime').min = minDateTime;
            
            setTimeout(() => {
                modal.querySelector('.modal-content').style.animation = 'modalSlideIn 0.5s ease';
            }, 10);
        } else {
            console.error('Modal element not found!');
        }
    }

    closeAddEventModal() {
        const modal = document.getElementById('addEventModal');
        modal.querySelector('.modal-content').style.animation = 'modalSlideOut 0.3s ease';
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            color: 'white',
            fontWeight: '600',
            zIndex: '9999',
            background: type === 'success' 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : type === 'error' 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            boxShadow: `0 0 20px ${type === 'success' ? 'rgba(16, 185, 129, 0.4)' : type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
            backdropFilter: 'blur(10px)',
            animation: 'slideInRight 0.5s ease'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }
}

// Global functions
function openAddEventModal() { 
    console.log('Global openAddEventModal called, app instance:', app);
    app.openAddEventModal(); 
}
function closeAddEventModal() { app.closeAddEventModal(); }
function fetchEvents() { 
    console.log('Global fetchEvents called, app instance:', app);
    if (app) {
        app.fetchExternalEvents(); 
    } else {
        console.error('App instance not available');
    }
}
function exportEvents() { 
    console.log('Global exportEvents called, app instance:', app);
    if (app) {
        app.exportEvents(); 
    } else {
        console.error('App instance not available');
    }
}
function importEvents(event) {
    const file = event.target.files[0];
    if (file) app.importEvents(file);
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    app = new EventSchedulerApp();
});

// Fallback for cases where DOM is already loaded
if (document.readyState === 'loading') {
    // Document is still loading, wait for DOMContentLoaded
} else {
    // Document is already loaded
    console.log('DOM already loaded, initializing app immediately...');
    app = new EventSchedulerApp();
}

// Event listeners
window.addEventListener('click', (e) => {
    const modal = document.getElementById('addEventModal');
    if (e.target === modal) closeAddEventModal();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('addEventModal');
        if (modal.style.display === 'block') closeAddEventModal();
    }
});