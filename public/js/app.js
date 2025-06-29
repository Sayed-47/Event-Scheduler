class EventSchedulerApp {
  constructor() {
    this.events = [];
    this.filteredEvents = [];
    this.currentView = 'grid';
    this.editingEventId = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadEvents();
    this.updateStats();
  }

  bindEvents() {
    // Modal events
    document.getElementById('addEventBtn').addEventListener('click', () => this.openModal());
    document.getElementById('fetchEventsBtn').addEventListener('click', () => this.fetchExternalEvents());
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
    document.getElementById('eventForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Search and filter events
    document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
    document.getElementById('categoryFilter').addEventListener('change', (e) => this.handleFilter());
    document.getElementById('statusFilter').addEventListener('change', (e) => this.handleFilter());

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.toggleView(e.target.dataset.view));
    });

    // Close modal on outside click
    document.getElementById('eventModal').addEventListener('click', (e) => {
      if (e.target.id === 'eventModal') {
        this.closeModal();
      }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('eventModal').classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  async loadEvents() {
    try {
      this.showLoading(true);
      const response = await fetch('/api/events');
      if (response.ok) {
        this.events = await response.json();
        this.filteredEvents = [...this.events];
        this.renderEvents();
        this.updateStats();
      } else {
        this.showNotification('Failed to load events', 'error');
      }
    } catch (error) {
      console.error('Error loading events:', error);
      this.showNotification('Error loading events', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async fetchExternalEvents() {
    try {
      this.showLoading(true);
      this.showNotification('Fetching events from external APIs...', 'info');
      
      const response = await fetch('/api/fetch-events', { method: 'POST' });
      
      if (response.ok) {
        const result = await response.json();
        this.showNotification(`Fetched ${result.newEvents} new events from external APIs`, 'success');
        await this.loadEvents(); // Reload events to show new ones
      } else {
        const error = await response.json();
        this.showNotification(error.error || 'Failed to fetch external events', 'error');
      }
    } catch (error) {
      console.error('Error fetching external events:', error);
      this.showNotification('Error fetching external events', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async saveEvent(eventData) {
    try {
      const url = this.editingEventId ? `/api/events/${this.editingEventId}` : '/api/events';
      const method = this.editingEventId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const savedEvent = await response.json();
        
        if (this.editingEventId) {
          const index = this.events.findIndex(e => e.id === this.editingEventId);
          if (index !== -1) {
            this.events[index] = savedEvent;
          }
          this.showNotification('Event updated successfully', 'success');
        } else {
          this.events.push(savedEvent);
          this.showNotification('Event created successfully', 'success');
        }
        
        this.handleFilter();
        this.updateStats();
        this.closeModal();
        return true;
      } else {
        const error = await response.json();
        this.showNotification(error.error || 'Failed to save event', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error saving event:', error);
      this.showNotification('Error saving event', 'error');
      return false;
    }
  }

  async deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.events = this.events.filter(e => e.id !== eventId);
        this.handleFilter();
        this.updateStats();
        this.showNotification('Event deleted successfully', 'success');
      } else {
        this.showNotification('Failed to delete event', 'error');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      this.showNotification('Error deleting event', 'error');
    }
  }

  openModal(event = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const title = document.getElementById('modalTitle');

    if (event) {
      this.editingEventId = event.id;
      title.textContent = 'Edit Event';
      this.populateForm(event);
    } else {
      this.editingEventId = null;
      title.textContent = 'Add New Event';
      form.reset();
      // Set default date to today
      document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    form.reset();
    this.editingEventId = null;
    
    // Clear any error states
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error', 'success');
    });
  }

  populateForm(event) {
    document.getElementById('eventTitle').value = event.title || '';
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventDate').value = event.date ? event.date.split('T')[0] : '';
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventCategory').value = event.category || 'technology';
    document.getElementById('eventUrl').value = event.url || '';
  }

  handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const eventData = {
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      date: formData.get('date'),
      time: formData.get('time'),
      location: formData.get('location').trim(),
      category: formData.get('category'),
      url: formData.get('url').trim()
    };

    // Validation
    if (!this.validateForm(eventData)) {
      return;
    }

    // Combine date and time
    if (eventData.date && eventData.time) {
      eventData.datetime = `${eventData.date}T${eventData.time}:00.000Z`;
    }

    this.saveEvent(eventData);
  }

  validateForm(data) {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
    });

    // Validate required fields
    if (!data.title) {
      this.setFieldError('eventTitle', 'Title is required');
      isValid = false;
    }

    if (!data.date) {
      this.setFieldError('eventDate', 'Date is required');
      isValid = false;
    }

    if (!data.time) {
      this.setFieldError('eventTime', 'Time is required');
      isValid = false;
    }

    // Validate URL if provided
    if (data.url && !this.isValidUrl(data.url)) {
      this.setFieldError('eventUrl', 'Please enter a valid URL');
      isValid = false;
    }

    return isValid;
  }

  setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const group = field.closest('.form-group');
    group.classList.add('error');
    
    // Remove existing error message
    const existingError = group.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    group.appendChild(errorDiv);
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  handleSearch(query) {
    this.handleFilter();
  }

  handleFilter() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;

    this.filteredEvents = this.events.filter(event => {
      const matchesSearch = !search || 
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search);
      
      const matchesCategory = !category || event.category === category;
      
      const eventStatus = this.getEventStatus(event);
      const matchesStatus = !status || eventStatus === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    this.renderEvents();
  }

  getEventStatus(event) {
    const now = new Date();
    const eventDate = new Date(event.datetime || event.date);
    
    if (eventDate > now) {
      return 'upcoming';
    } else if (eventDate.toDateString() === now.toDateString()) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }

  toggleView(view) {
    this.currentView = view;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Update container class
    const container = document.getElementById('eventsContainer');
    container.classList.toggle('list-view', view === 'list');
    
    this.renderEvents();
  }

  renderEvents() {
    const container = document.getElementById('eventsContainer');
    const emptyState = document.getElementById('emptyState');

    if (this.filteredEvents.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    
    container.innerHTML = this.filteredEvents.map(event => this.createEventCard(event)).join('');
    
    // Bind event card actions
    this.bindEventCardActions();
  }

  createEventCard(event) {
    const status = this.getEventStatus(event);
    const eventDate = new Date(event.datetime || event.date);
    const formattedDate = eventDate.toLocaleDateString();
    const formattedTime = event.time || eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const listViewClass = this.currentView === 'list' ? 'list-view' : '';
    
    return `
      <div class="event-card ${listViewClass}" data-id="${event.id}">
        <div class="event-card-header">
          <div class="event-category">${event.category}</div>
          <h3 class="event-title">${event.title}</h3>
          ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
          <div class="event-meta">
            <div class="event-meta-item">
              <i class="fas fa-calendar"></i>
              <span>${formattedDate}</span>
            </div>
            <div class="event-meta-item">
              <i class="fas fa-clock"></i>
              <span>${formattedTime}</span>
            </div>
            ${event.location ? `
              <div class="event-meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${event.location}</span>
              </div>
            ` : ''}
            ${event.url ? `
              <div class="event-meta-item">
                <i class="fas fa-external-link-alt"></i>
                <a href="${event.url}" target="_blank" rel="noopener noreferrer">Event Link</a>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="event-actions">
          <div class="event-status ${status}">${status}</div>
          <div class="event-buttons">
            <button class="event-btn edit-btn" data-id="${event.id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="event-btn danger delete-btn" data-id="${event.id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEventCardActions() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.id;
        const event = this.events.find(e => e.id === eventId);
        if (event) {
          this.openModal(event);
        }
      });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.dataset.id;
        this.deleteEvent(eventId);
      });
    });
  }

  updateStats() {
    const total = this.events.length;
    const upcoming = this.events.filter(e => this.getEventStatus(e) === 'upcoming').length;
    const categories = new Set(this.events.map(e => e.category)).size;
    const apiEvents = this.events.filter(e => e.source && e.source !== 'manual').length;

    document.getElementById('totalEvents').textContent = total;
    document.getElementById('upcomingEvents').textContent = upcoming;
    document.getElementById('eventCategories').textContent = categories;
    document.getElementById('apiEvents').textContent = apiEvents;
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
      overlay.style.display = 'flex';
    } else {
      overlay.style.display = 'none';
    }
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="${iconMap[type]}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.removeNotification(notification);
    });

    container.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        this.removeNotification(notification);
      }
    }, 5000);
  }

  removeNotification(notification) {
    notification.classList.add('removing');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.eventApp = new EventSchedulerApp();
});
