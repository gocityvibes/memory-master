
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const reminderSchema = new mongoose.Schema({
  text: String,
  timestamp: String,
});

const Reminder = mongoose.model('Reminder', reminderSchema);

app.use(cors());
app.use(express.json());

app.post('/api/reminder', async (req, res) => {
  const reminder = new Reminder(req.body);
  await reminder.save();
  res.send({ status: 'Reminder saved to MongoDB' });
});

app.get('/api/reminders', async (req, res) => {
  const reminders = await Reminder.find({});
  res.send(reminders);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
