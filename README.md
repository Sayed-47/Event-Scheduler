# 🎯 Event Scheduler - Modern Web Application

A full-stack event management system built with **Node.js**, **Express**, and modern web technologies. This project demonstrates the implementation of **Data Structures & Algorithms** (DSA) concepts in a real-world application.

![Event Scheduler Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Beautiful gradient design** with soft, professional colors
- **Responsive layout** that works on all devices
- **Modern typography** using Inter font family
- **Smooth animations** and hover effects
- **Intuitive user interface** with clear visual feedback

### 📊 **Core Functionality**
- ✅ **Add Events** - Create new events with title, date, location, and description
- 🔍 **Search & Filter** - Real-time search with multiple sorting options
- 📱 **External Integration** - Fetch events from external sources
- 📁 **Import/Export** - JSON file import/export functionality
- 📈 **Statistics Dashboard** - Track total, upcoming, and today's events

### 🔧 **Technical Features**
- **Binary Search Tree (BST)** for efficient event organization
- **Hash Table** implementation for O(1) event lookups
- **RESTful API** with comprehensive error handling
- **File-based persistence** with automatic backups
- **Real-time notifications** for user feedback

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/event-scheduler.git
   cd event-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
event-scheduler/
├── 📂 public/                 # Frontend assets
│   ├── 📂 css/               # Stylesheets
│   │   ├── main.css          # Main styles & variables
│   │   ├── components.css    # Component-specific styles
│   │   └── modal.css         # Modal & form styles
│   ├── 📂 js/                # Client-side JavaScript
│   │   └── app.js            # Main application logic
│   └── index.html            # Main HTML page
├── 📂 src/                   # Backend source code
│   ├── 📂 Models/            # Data structures
│   │   ├── BST.js            # Binary Search Tree implementation
│   │   └── EventScheduler.js # Main scheduler logic
│   ├── 📂 routes/            # API endpoints
│   │   ├── events.js         # Event CRUD operations
│   │   └── api.js            # Additional API routes
│   └── 📂 services/          # Business logic
│       └── dataService.js    # File I/O operations
├── 📂 data/                  # Data storage
│   ├── events.json           # Main events database
│   └── 📂 backups/           # Automatic backups
├── 📂 uploads/               # File upload directory
├── server.js                 # Express server setup
├── package.json              # Dependencies & scripts
└── README.md                 # This file
```

## 🔧 API Endpoints

### Events API
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | Get all events with optional filters |
| `POST` | `/api/events` | Create a new event |
| `DELETE` | `/api/events/:id` | Delete an event by ID |
| `GET` | `/api/events/stats` | Get event statistics |
| `GET` | `/api/events/export/json` | Export events as JSON |

### Additional APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/fetch-external` | Fetch events from external sources |
| `POST` | `/api/import` | Import events from JSON file |
| `GET` | `/api/backups` | List available backups |

## 💾 Data Structures Implementation

### Binary Search Tree (BST)
```javascript
// Events are organized by date for efficient searching
class BST {
    insert(event) { /* O(log n) insertion */ }
    search(date) { /* O(log n) search */ }
    delete(event) { /* O(log n) deletion */ }
}
```

### Hash Table
```javascript
// Quick event lookups by ID
class EventHashTable {
    get(id) { /* O(1) retrieval */ }
    set(id, event) { /* O(1) storage */ }
    delete(id) { /* O(1) deletion */ }
}
```

## 🎨 Styling & Design

The application features a **modern, professional design** with:

- **Color Palette**: Soft blues, purples, and neutral grays
- **Typography**: Inter font family for excellent readability
- **Layout**: Clean grid-based design with proper spacing
- **Animations**: Subtle hover effects and smooth transitions
- **Responsiveness**: Mobile-first design approach

## 📱 Browser Support

- ✅ **Chrome** (80+)
- ✅ **Firefox** (75+)
- ✅ **Safari** (13+)
- ✅ **Edge** (80+)

## 🔧 Development Scripts

```bash
# Start the server
npm start

# Development mode with auto-restart
npm run dev

# Run tests
npm test
```

## 🛠️ Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### Data Storage
- Events are stored in `data/events.json`
- Automatic backups are created in `data/backups/`
- File uploads are saved in `uploads/`

## 🚀 Deployment

### Local Deployment
```bash
npm start
```

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure reverse proxy (nginx/Apache)
3. Set up process manager (PM2)
4. Configure SSL certificates

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- **Node.js** community for excellent documentation
- **Express.js** for the robust web framework
- **Modern CSS** techniques for beautiful styling
- **Data Structures** concepts for efficient algorithms

---

⭐ **Star this repository** if you found it helpful!

🐛 **Report bugs** in the [Issues](https://github.com/yourusername/event-scheduler/issues) section

💡 **Suggest features** via [Pull Requests](https://github.com/yourusername/event-scheduler/pulls)
