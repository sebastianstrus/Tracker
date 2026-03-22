const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());

// funkcja do zapisu
function saveLog(newLog) {
  let logs = [];

  // jeśli plik istnieje → wczytaj
  if (fs.existsSync("logs.json")) {
    const data = fs.readFileSync("logs.json");
    logs = JSON.parse(data);
  }

  logs.push(newLog);

  // opcjonalny limit (np. 1000 logów)
  if (logs.length > 1000) {
    logs.shift();
  }

  fs.writeFileSync("logs.json", JSON.stringify(logs, null, 2));
}

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});