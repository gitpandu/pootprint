import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import db from './database.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Get all entries
app.get('/api/entries', (req, res) => {
    try {
        const entries = db.prepare('SELECT * FROM entries ORDER BY datetime DESC').all();
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add an entry
app.post('/api/entries', (req, res) => {
    try {
        const { datetime, consistency, amount, note } = req.body;
        const id = uuidv4();
        const timestamp = new Date().toISOString();

        const stmt = db.prepare('INSERT INTO entries (id, datetime, consistency, amount, note, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(id, datetime, consistency, amount, note, timestamp);

        res.status(201).json({ id, datetime, consistency, amount, note, timestamp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an entry
app.put('/api/entries/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { datetime, consistency, amount, note } = req.body;

        const stmt = db.prepare('UPDATE entries SET datetime = ?, consistency = ?, amount = ?, note = ? WHERE id = ?');
        const result = stmt.run(datetime, consistency, amount, note, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.json({ id, datetime, consistency, amount, note });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an entry
app.delete('/api/entries/:id', (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare('DELETE FROM entries WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
