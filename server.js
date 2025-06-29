require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const MultiAPIService = require('./src/services/multiAPIService');

const app = express();
const PORT = process.env.PORT || 3000;
const multiAPIService = new MultiAPIService();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/events', require('./src/routes/events'));
app.use('/api', require('./src/routes/api'));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🎉 EventX Server running on port ${PORT}`);
  console.log(`🌐 Access the app at http://localhost:${PORT}`);
  console.log('� Use the "Fetch Events" button to get CSE events for approval');
});
