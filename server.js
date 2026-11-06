require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'apartment_visitors',
  waitForConnections: true,
  connectionLimit: 10
});

app.get('/api/residents', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM residents ORDER BY resident_id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Could not load residents. Check MySQL setup.' }); }
});

app.post('/api/residents', async (req, res) => {
  const { name, flat_no, phone, email } = req.body;
  if (!name || !flat_no) return res.status(400).json({ error: 'Name and flat number are required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO residents (name, flat_no, phone, email) VALUES (?, ?, ?, ?)',
      [name, flat_no, phone || null, email || null]
    );
    res.json({ resident_id: result.insertId, message: 'Resident added successfully.' });
  } catch (e) { res.status(500).json({ error: 'Could not add resident.' }); }
});

app.get('/api/visitors', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, r.name AS resident_name, r.flat_no
       FROM visitors v JOIN residents r ON v.resident_id = r.resident_id
       ORDER BY v.visitor_id DESC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Could not load visitors.' }); }
});

app.post('/api/visitors', async (req, res) => {
  const { name, phone, vehicle_no, resident_id, purpose } = req.body;
  if (!name || !resident_id) return res.status(400).json({ error: 'Visitor name and resident are required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO visitors (name, phone, vehicle_no, resident_id, purpose) VALUES (?, ?, ?, ?, ?)',
      [name, phone || null, vehicle_no || null, resident_id, purpose || null]
    );
    res.json({ visitor_id: result.insertId, message: 'Visitor registered. Entry recorded.' });
  } catch (e) { res.status(500).json({ error: 'Could not register visitor. Check resident ID.' }); }
});

app.patch('/api/visitors/:id/exit', async (req, res) => {
  try {
    const [result] = await pool.execute(
      "UPDATE visitors SET exit_time = NOW(), status = 'OUT' WHERE visitor_id = ? AND status = 'IN'",
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Visitor not found or already checked out.' });
    res.json({ message: 'Visitor exit recorded.' });
  } catch (e) { res.status(500).json({ error: 'Could not record exit.' }); }
});

app.listen(process.env.PORT || 3000, () => console.log(`Server running at http://localhost:${process.env.PORT || 3000}`));
