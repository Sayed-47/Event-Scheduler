# EventX - Algo Based Event Management System

A comprehensive event management system that integrates with multiple event APIs (Ticketmaster, Eventbrite) and provides advanced scheduling capabilities with sophisticated data structures and algorithms implementation.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Data Structures & Algorithms](#data-structures--algorithms)
- [Event Approval Workflow](#event-approval-workflow)
- [Frontend Features](#frontend-features)
- [Backend Architecture](#backend-architecture)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

EventX is an algorithm-based full-stack event management system designed to help users discover, manage, and organize events efficiently. The application integrates with major event platforms and implements sophisticated data structures and algorithms for optimal event search, sorting, and filtering capabilities.

### Key Capabilities

- Multi-API event aggregation from Ticketmaster and Eventbrite
- Manual event creation with custom fields
- Event approval workflow for external events
- Advanced search and filter functionality
- Responsive UI with grid and list views
- Persistent data storage
- Image/banner management for events

## Features

### Core Functionality

- **Event Management**
  - Create, read, update, and delete events
  - Upload custom banner images for events
  - Support for event categories (technology, conference, workshop, etc.)
  - Event detail modal with full information display

- **API Integration**
  - Ticketmaster API integration for live events
  - Eventbrite API integration for community events
  - Automatic image extraction from API responses
  - Real-time event fetching and synchronization

- **Search & Filter**
  - Multiple search algorithms (Linear, Binary, Jump, Interpolation)
  - Category-based filtering
  - Date range filtering
  - Location-based search
  - Real-time search with debouncing

- **Sorting Capabilities**
  - Quick Sort
  - Merge Sort
  - Heap Sort
  - Bubble Sort
  - Sort by date, title, or category

- **Event Approval System**
  - Pending events queue for external API events
  - Manual approval/rejection workflow
  - Separate storage for approved and pending events

### User Interface

- Modern, responsive design
- Dark theme interface
- Grid and list view modes
- Interactive event cards with hover effects
- Modal-based event details and editing
- Loading states and error handling
- Mobile-friendly layout

## Technology Stack

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Axios** - HTTP client for API requests
- **Multer** - File upload middleware
- **Helmet** - Security middleware
- **Compression** - Response compression
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend

- **HTML5** - Structure and markup
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - Client-side functionality
- **Font Awesome** - Icon library

### External APIs

- **Ticketmaster Discovery API** - Professional events data
- **Eventbrite API** - Community events data

## Project Structure

```
EventX/
├── data/
│   └── events.json              # Persistent event storage
├── public/
│   ├── css/
│   │   ├── styles.css           # Main styles
│   │   └── event-cards.css      # Event card styles
│   ├── js/
│   │   └── app.js               # Frontend application logic
│   └── index.html               # Main HTML file
├── src/
│   ├── models/
│   │   └── EventScheduler.js    # Core event management logic
│   ├── routes/
│   │   ├── api.js               # API route handlers
│   │   └── events.js            # Event route handlers
│   └── services/
│       ├── dataService.js       # Data persistence service
│       ├── eventbriteService.js # Eventbrite API integration
│       ├── ticketmasterService.js # Ticketmaster API integration
│       └── multiAPIService.js   # Multi-API orchestration
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Project dependencies
├── server.js                    # Express server entry point
└── README.md                    # Documentation

```

## Prerequisites

Before installing and running this application, ensure you have:

- **Node.js** (version 14.x or higher)
- **npm** (Node Package Manager)
- **Ticketmaster API Key** ([Get one here](https://developer.ticketmaster.com/))
- **Eventbrite API Key** ([Get one here](https://www.eventbrite.com/platform/api))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sayed-47/EventX.git
cd EventX
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following configuration:

```env
NODE_ENV=development
PORT=3000
TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
EVENTBRITE_API_KEY=your_eventbrite_api_key_here
```

### 4. Initialize Data Directory

The application will automatically create the `data` directory and `events.json` file on first run.

## Configuration

### Server Configuration

Modify server settings in `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

### API Service Configuration

Configure API endpoints and parameters in the respective service files:

- `src/services/ticketmasterService.js` - Ticketmaster configuration
- `src/services/eventbriteService.js` - Eventbrite configuration

### Search Algorithm Configuration

The application supports multiple search algorithms. Configure the default in `src/models/EventScheduler.js`:

```javascript
// Available algorithms: 'linear', 'binary', 'jump', 'interpolation'
const defaultSearchAlgorithm = 'linear';
```

## Usage

### Starting the Server

**Development Mode** (with auto-restart):

```bash
npm run dev
```

**Production Mode**:

```bash
npm start
```

The server will start on `http://localhost:3000`

### Using the Application

#### 1. Creating Manual Events

1. Click the "Add Event" button
2. Fill in event details:
   - Title (required)
   - Description
   - Date and time
   - Location
   - Category
   - Event URL
   - Banner URL (optional)
3. Click "Save Event"

#### 2. Fetching External Events

1. Click "Fetch Events" button
2. Enter a keyword or category
3. Select API source (Ticketmaster/Eventbrite/Both)
4. Review pending events in the approval queue
5. Approve or reject each event

#### 3. Searching Events

- Use the search bar to find events by title, description, or location
- Select search algorithm from the dropdown
- Results update in real-time

#### 4. Filtering Events

- Filter by category (technology, conference, workshop, etc.)
- Filter by date range
- Filters can be combined for refined results

#### 5. Sorting Events

- Click the sort dropdown
- Select sorting algorithm
- Choose sort criteria (date, title, category)
- View performance metrics

#### 6. Viewing Event Details

- Click on any event card
- View full description, location, and timing
- See event images/banners
- Access external event links

## API Documentation

### Event Endpoints

#### GET `/api/events`

Retrieve all approved events.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Event Title",
    "description": "Event description",
    "date": "2025-01-15",
    "time": "10:00",
    "datetime": "2025-01-15T10:00:00.000Z",
    "location": "Event Location",
    "category": "technology",
    "url": "https://example.com/event",
    "bannerUrl": "https://example.com/banner.jpg",
    "source": "manual",
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:00:00.000Z"
  }
]
```

#### POST `/api/events`

Create a new event.

**Request Body:**
```json
{
  "title": "Event Title",
  "description": "Event description",
  "date": "2025-01-15",
  "time": "10:00",
  "location": "Event Location",
  "category": "technology",
  "url": "https://example.com/event",
  "bannerUrl": "https://example.com/banner.jpg"
}
```

#### PUT `/api/events/:id`

Update an existing event.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### DELETE `/api/events/:id`

Delete an event.

**Response:**
```json
{
  "message": "Event deleted successfully"
}
```

### External API Endpoints

#### POST `/api/fetch-events`

Fetch events from external APIs.

**Request Body:**
```json
{
  "keyword": "technology",
  "source": "ticketmaster"
}
```

**Response:**
```json
{
  "pendingEvents": [...],
  "count": 10
}
```

#### POST `/api/approve-event`

Approve a pending event.

**Request Body:**
```json
{
  "eventId": "uuid"
}
```

#### POST `/api/reject-event`

Reject a pending event.

**Request Body:**
```json
{
  "eventId": "uuid"
}
```

### Search & Sort Endpoints

#### GET `/api/events/search`

Search events with advanced algorithms.

**Query Parameters:**
- `query` - Search term
- `algorithm` - Search algorithm (linear, binary, jump, interpolation)
- `category` - Filter by category
- `dateFrom` - Start date filter
- `dateTo` - End date filter

#### GET `/api/events/sort`

Sort events with specified algorithm.

**Query Parameters:**
- `algorithm` - Sort algorithm (quicksort, mergesort, heapsort, bubblesort)
- `criteria` - Sort by (date, title, category)

## Data Structures & Algorithms

### Search Algorithms

#### Linear Search
- **Time Complexity**: O(n)
- **Use Case**: Unsorted data, small datasets
- **Best For**: General-purpose searching

#### Binary Search
- **Time Complexity**: O(log n)
- **Use Case**: Sorted data
- **Best For**: Large sorted datasets

#### Jump Search
- **Time Complexity**: O(√n)
- **Use Case**: Sorted data, better than linear
- **Best For**: Medium to large sorted datasets

#### Interpolation Search
- **Time Complexity**: O(log log n) average case
- **Use Case**: Uniformly distributed sorted data
- **Best For**: Large datasets with uniform distribution

### Sorting Algorithms

#### Quick Sort
- **Time Complexity**: O(n log n) average, O(n²) worst
- **Space Complexity**: O(log n)
- **Best For**: General-purpose sorting

#### Merge Sort
- **Time Complexity**: O(n log n) guaranteed
- **Space Complexity**: O(n)
- **Best For**: Stable sorting, linked lists

#### Heap Sort
- **Time Complexity**: O(n log n)
- **Space Complexity**: O(1)
- **Best For**: Memory-constrained environments

#### Bubble Sort
- **Time Complexity**: O(n²)
- **Space Complexity**: O(1)
- **Best For**: Educational purposes, nearly sorted data

### Data Structures Used

- **Arrays** - Event storage and manipulation
- **Hash Maps** - Fast event lookup by ID
- **Binary Search Trees** - Efficient sorted data access
- **Heaps** - Priority-based event management

## Event Approval Workflow

### Workflow Steps

1. **Fetch Events**: User initiates external event fetch
2. **Pending Queue**: Events are stored in pending state
3. **Review**: User reviews event details
4. **Approve/Reject**: User makes decision
5. **Storage**: Approved events move to main storage
6. **Display**: Approved events appear in the interface

### Pending Events Management

Pending events are stored separately and include:
- All original API data
- Timestamp of fetch
- Source information
- Approval status

### Approval Criteria

Users should consider:
- Event relevance to the platform
- Data quality and completeness
- Date validity
- Location appropriateness

## Frontend Features

### Event Cards

Event cards display:
- Banner image (if available)
- Event title and category
- Short description (100 characters)
- Date, time, and location icons
- Edit and delete buttons

### Event Detail Modal

The modal shows:
- Full event description
- Complete date and time information
- Full location details
- External event link
- Category and source information

### View Modes

- **Grid View**: Cards in a responsive grid layout
- **List View**: Compact list with essential information

### Responsive Design

The interface adapts to:
- Desktop screens (1200px+)
- Tablets (768px - 1199px)
- Mobile devices (< 768px)

## Backend Architecture

### Service Layer

**DataService**: Handles file-based persistence
- Read/write operations
- Data validation
- Error handling

**TicketmasterService**: Ticketmaster API integration
- Event fetching
- Image extraction
- Data transformation

**EventbriteService**: Eventbrite API integration
- Event fetching
- Logo extraction
- Data normalization

**MultiAPIService**: Orchestrates multiple API services
- Aggregates results
- Deduplicates events
- Manages pending events

### Model Layer

**EventScheduler**: Core business logic
- Event CRUD operations
- Search algorithm implementation
- Sort algorithm implementation
- Event validation

### Route Layer

**Event Routes**: RESTful API endpoints
**API Routes**: External API and utility endpoints

## Deployment

### Heroku Deployment

1. Create a Heroku account
2. Install Heroku CLI
3. Create a new app:

```bash
heroku create eventx-app
```

4. Set environment variables:

```bash
heroku config:set TICKETMASTER_API_KEY=your_key
heroku config:set EVENTBRITE_API_KEY=your_key
```

5. Deploy:

```bash
git push heroku main
```

### Vercel Deployment

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t eventx .
docker run -p 3000:3000 --env-file .env eventx
```

## Contributing

Contributions are welcome! Please follow these guidelines:

### How to Contribute

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Write or update tests if applicable
5. Commit your changes:
   ```bash
   git commit -m "Add feature: your feature description"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request

### Contribution Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Update documentation for new features
- Test your changes thoroughly
- Keep pull requests focused and atomic

### Areas for Contribution

- Add support for more event APIs (Google Calendar, Facebook Events)
- Implement user authentication and authorization
- Add event reminder notifications
- Create event export functionality (iCal, CSV)
- Improve search relevance with machine learning
- Add unit and integration tests
- Enhance mobile responsiveness
- Implement event categories management
- Add event analytics and insights

## Troubleshooting

### Common Issues

**Issue**: Server won't start
- **Solution**: Check if port 3000 is available or change PORT in `.env`

**Issue**: API requests failing
- **Solution**: Verify API keys are correctly set in `.env` file

**Issue**: Events not displaying
- **Solution**: Check `data/events.json` exists and is valid JSON

**Issue**: Images not loading
- **Solution**: Check CORS settings and image URL validity

**Issue**: Search not working
- **Solution**: Ensure events have searchable fields (title, description)

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

### Data Reset

To reset all events:

```bash
rm data/events.json
# Restart the server - file will be recreated
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- Ticketmaster for providing event data API
- Eventbrite for community events API
- Font Awesome for icon library
- The open-source community for dependencies

## Author

**Abu Sayed**

- GitHub: [@Sayed-47](https://github.com/Sayed-47)
- Project: [EventX](https://github.com/Sayed-47/EventX)

## Future Enhancements

- User authentication and personal event calendars
- Social sharing capabilities
- Event recommendations based on preferences
- Calendar integration (Google Calendar, Outlook)
- Email notifications for upcoming events
- Event check-in and attendance tracking
- Multi-language support
- Advanced analytics dashboard
- Mobile application (React Native)
- GraphQL API support
- WebSocket for real-time updates
- Event collaboration features
- Payment integration for ticketed events

---

For questions, issues, or feature requests, please open an issue on GitHub.
