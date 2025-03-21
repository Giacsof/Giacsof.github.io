const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'supersecretkey';

app.use(express.json());
app.use(cors());

// Connessione al database SQLite
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

// Creazione tabella utenti se non esiste
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)`);

// Route per autenticazione
const authRoutes = express.Router();

// Login
authRoutes.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Errore server' });
        if (!user) return res.status(400).json({ message: 'Utente non trovato' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Password errata' });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Richiesta reset password
authRoutes.post('/reset-request', (req, res) => {
    const { email } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ message: 'Errore server' });
        if (!user) return res.status(400).json({ message: 'Email non registrata' });
        
        // Simulazione invio email con link di reset (da integrare con nodemailer)
        const resetToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: '15m' });
        console.log(`Token reset per ${email}: ${resetToken}`);
        res.json({ message: 'Se esiste un account con questa email, riceverai un link di reset' });
    });
});

// Reimpostazione password
authRoutes.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, decoded.email], (err) => {
            if (err) return res.status(500).json({ message: 'Errore server' });
            res.json({ message: 'Password aggiornata con successo' });
        });
    } catch (err) {
        res.status(400).json({ message: 'Token non valido o scaduto' });
    }
});

app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
