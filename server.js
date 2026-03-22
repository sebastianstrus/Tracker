const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS (MUSI być wcześniej)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// funkcja do zapisu
function saveLog(newLog) {
  let logs = [];

  if (fs.existsSync("logs.json")) {
    const data = fs.readFileSync("logs.json");
    logs = JSON.parse(data);
  }

  logs.push(newLog);

  if (logs.length > 1000) {
    logs.shift();
  }

  fs.writeFileSync("logs.json", JSON.stringify(logs, null, 2));
}

// endpoint logowania
app.post("/log", (req, res) => {
  const log = {
    time: new Date().toISOString(),
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
    language: req.headers["accept-language"],
  };

  saveLog(log);
  res.sendStatus(200);
});

// dashboard
app.get("/dashboard", (req, res) => {
  res.send("test dashboard");
});

// opcjonalnie root
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// 🚀 NA SAMYM KOŃCU
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});