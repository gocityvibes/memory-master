
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const { Configuration, OpenAIApi } = require('openai');

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const reminderSchema = new mongoose.Schema({
  text: String,
  timestamp: String,
  email: String,
  phone: String
});

const Reminder = mongoose.model('Reminder', reminderSchema);

app.use(cors());
app.use(express.json());

app.post('/api/reminder', async (req, res) => {
  const { text, email, phone } = req.body;

  const gptResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Convert natural language reminders into ISO timestamped actions. Respond in JSON like: {"text":"Take medicine","timestamp":"2025-07-13T08:00:00Z"}" },
      { role: "user", content: text }
    ]
  });

  let parsed;
  try {
    parsed = JSON.parse(gptResponse.data.choices[0].message.content);
  } catch (err) {
    return res.status(500).send({ error: "Failed to parse GPT response", raw: gptResponse.data.choices[0].message.content });
  }

  const reminder = new Reminder({ text: parsed.text, timestamp: parsed.timestamp, email, phone });
  await reminder.save();

  if (email) {
    const msg = {
      to: email,
      from: 'noreply@memorymaster.app',
      subject: 'Memory Master Reminder',
      text: `Reminder: ${parsed.text} at ${parsed.timestamp}`
    };
    await sgMail.send(msg);
  }

  if (phone) {
    await twilioClient.messages.create({
      body: `Reminder: ${parsed.text} at ${parsed.timestamp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
  }

  res.send({ status: 'Reminder parsed, saved, and notifications sent', parsed });
});

app.get('/api/reminders', async (req, res) => {
  const reminders = await Reminder.find({});
  res.send(reminders);
});

app.listen(PORT, () => console.log(`GPT-enhanced server running on port ${PORT}`));
