const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'supersecretkey';

app.use(express.json());
app.use(cors());

const USERS_FILE = 'users.json';

// Funzione per leggere utenti dal file JSON
const readUsers = () => {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`[ERROR] Errore nella lettura di ${USERS_FILE}:`, err);
        return [];
    }
};

// Funzione per scrivere utenti nel file JSON
const writeUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error(`[ERROR] Errore nella scrittura di ${USERS_FILE}:`, err);
    }
};

// Route per autenticazione
const authRoutes = express.Router();

// Login
authRoutes.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log(`[LOGIN ATTEMPT] Username: ${username}`);

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        console.warn(`[LOGIN FAILED] Utente non trovato: ${username}`);
        return res.status(400).json({ message: 'Username o password errati' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        console.warn(`[LOGIN FAILED] Password errata per utente: ${username}`);
        return res.status(401).json({ message: 'Username o password errati' });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    console.log(`[LOGIN SUCCESS] Utente: ${username}`);
    res.json({ token });
});

// Richiesta reset password (simulata)
authRoutes.post('/reset-request', (req, res) => {
    const { username } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        console.warn(`[RESET FAILED] Utente non trovato: ${username}`);
        return res.status(400).json({ message: 'Username non registrato' });
    }

    const resetToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: '15m' });
    console.log(`🔑 Token reset per ${username}: ${resetToken}`);
    res.json({ message: 'Se l’utente esiste, riceverà un link di reset' });
});

// Reimpostazione password
authRoutes.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const users = readUsers();
        const userIndex = users.findIndex(u => u.username === decoded.username);

        if (userIndex === -1) {
            console.warn(`[RESET FAILED] Utente non trovato nel reset: ${decoded.username}`);
            return res.status(400).json({ message: 'Token non valido' });
        }

        users[userIndex].password = await bcrypt.hash(newPassword, 10);
        writeUsers(users);
        console.log(`[RESET SUCCESS] Password aggiornata per: ${decoded.username}`);
        res.json({ message: 'Password aggiornata con successo' });
    } catch (err) {
        console.error(`[ERROR] Token non valido:`, err);
        res.status(400).json({ message: 'Token non valido o scaduto' });
    }
});

app.use('/auth', authRoutes);
const RSVP_FILE = 'rsvp.json';

// Funzione per leggere RSVP dal file JSON
const readRSVPs = () => {
    try {
        const data = fs.readFileSync(RSVP_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`[ERROR] Errore nella lettura di ${RSVP_FILE}:`, err);
        return [];
    }
};

// Funzione per scrivere RSVP nel file JSON
const writeRSVPs = (rsvps) => {
    try {
        fs.writeFileSync(RSVP_FILE, JSON.stringify(rsvps, null, 2));
    } catch (err) {
        console.error(`[ERROR] Errore nella scrittura di ${RSVP_FILE}:`, err);
    }
};

// Endpoint per ricevere RSVP
app.post('/rsvp', (req, res) => {
    const { name, surname, attendance, menu, note, message } = req.body;

    const rsvps = readRSVPs();
    const newRSVP = { name, surname, attendance, menu, note, message };
    rsvps.push(newRSVP);

    writeRSVPs(rsvps);

    console.log(`[RSVP] Nuovo RSVP registrato:`, newRSVP);
    res.json({ message: 'RSVP salvato con successo!' });
});

// Avvio server
app.listen(PORT, () => {
    console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
});
