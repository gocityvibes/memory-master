const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging the Mongo URI (for debug only - remove in prod)
console.log("Mongo URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Sample route
app.get('/', (req, res) => {
  res.send('Memory Master backend is running!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});