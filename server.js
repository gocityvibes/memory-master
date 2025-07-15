
const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

const messages = [
  {
    role: "system",
    content: "Convert natural language reminders into ISO timestamped actions. Respond in JSON like: {\"text\":\"Take medicine\",\"timestamp\":\"2025-07-13T08:00:00Z\"}"
  }
];

// Health check route
app.get("/", (req, res) => {
  res.send("Memory Master backend is running.");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
