const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Memory Master Backend is running');
});

app.post('/api/setup', (req, res) => {
  console.log("Setup data received:", req.body);
  res.json({ success: true, received: req.body });
});

app.post('/api/gpt', (req, res) => {
  const { query } = req.body;
  console.log("GPT query received:", query);
  // Placeholder for GPT logic
  res.json({ reply: `📣 (Simulated GPT Response) You said: ${query}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
