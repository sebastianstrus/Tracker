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

app.get("/logs", (req, res) => {
  if (!fs.existsSync("logs.json")) return res.json([]);
  res.sendFile(__dirname + "/logs.json");
});

app.get("/dashboard", (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Dashboard</title>
      <style>
        body {
          font-family: sans-serif;
          background: #111;
          color: #eee;
          padding: 20px;
        }
        h1 {
          margin-bottom: 20px;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #333;
          font-size: 14px;
        }
        th {
          text-align: left;
          color: #aaa;
        }
        tr:hover {
          background: #222;
        }
      </style>
    </head>
    <body>
      <h1>Logs Dashboard</h1>
      <table id="table">
        <tr>
          <th>Time</th>
          <th>IP</th>
          <th>Language</th>
          <th>Device</th>
        </tr>
      </table>

      <script>
        fetch('/logs')
          .then(res => res.json())
          .then(data => {
            const table = document.getElementById('table');

            data.reverse().forEach(log => {
              const row = document.createElement('tr');

              row.innerHTML = \`
                <td>\${log.time}</td>
                <td>\${log.ip}</td>
                <td>\${log.language}</td>
                <td>\${log.userAgent}</td>
              \`;

              table.appendChild(row);
            });
          });
      </script>
    </body>
    </html>
  `);
});

// opcjonalnie root
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// 🚀 NA SAMYM KOŃCU
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});