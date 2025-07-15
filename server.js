const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const twilio = require('twilio');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Twilio setup
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// Reminder Schema
const reminderSchema = new mongoose.Schema({
  text: String,
  timestamp: String
});

const Reminder = mongoose.model('Reminder', reminderSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Memory Master backend with MongoDB and Twilio is running.");
});

app.post("/api/setup", (req, res) => {
  console.log("Setup data received:", req.body);
  res.json({ success: true, received: req.body });
});

app.post("/api/reminders", async (req, res) => {
  try {
    const { text, timestamp, phone } = req.body;

    const newReminder = new Reminder({ text, timestamp });
    await newReminder.save();

    if (phone) {
      await client.messages.create({
        body: `🔔 Reminder: ${text} at ${timestamp}`,
        from: process.env.TWILIO_PHONE,
        to: phone
      });
    }

    res.json({ success: true, reminder: newReminder });
  } catch (err) {
    console.error("Reminder error:", err);
    res.status(500).json({ error: "Failed to create reminder" });
  }
});

app.get("/api/reminders", async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ timestamp: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: "Failed to load reminders" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
