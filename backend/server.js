const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Update these with your DB credentials
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'chrome_time_tracker'
};

let pool;
(async () => {
  pool = await mysql.createPool(dbConfig);
  // Create tables if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS time_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(128),
      domain VARCHAR(255),
      seconds INT,
      type VARCHAR(32),
      day DATE
    )
  `);
})();

// Save time log (called by extension)
app.post('/api/log', async (req, res) => {
  const { user_id, domain, seconds, type, day } = req.body;
  if (!user_id || !domain || !seconds || !type || !day) return res.status(400).send('Missing fields');
  await pool.query(
    `INSERT INTO time_logs (user_id, domain, seconds, type, day)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE seconds = seconds + VALUES(seconds)`,
    [user_id, domain, seconds, type, day]
  );
  res.sendStatus(200);
});

// Get today's stats for a user
app.get('/api/today', async (req, res) => {
  const { user_id } = req.query;
  const [rows] = await pool.query(
    `SELECT domain, type, SUM(seconds) as seconds
     FROM time_logs
     WHERE user_id = ? AND day = CURDATE()
     GROUP BY domain, type`, [user_id]
  );
  res.json(rows);
});

// Get weekly report for a user
app.get('/api/weekly', async (req, res) => {
  const { user_id } = req.query;
  const [rows] = await pool.query(
    `SELECT type, SUM(seconds) as seconds
     FROM time_logs
     WHERE user_id = ? AND day >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY type`, [user_id]
  );
  res.json(rows);
});

// Added friendly message at /api
app.get('/api', (req, res) => {
  res.send('API is running. Use /api/log, /api/today, or /api/weekly.');
});

const port = 3000;
app.listen(port, () => console.log(`Backend API running on port ${port}`));
