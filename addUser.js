const fs = require('fs');
const bcrypt = require('bcrypt');

const USERS_FILE = 'users.json';

const addUser = async (username, plainPassword) => {
    let users = [];
    
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        users = JSON.parse(data);
    } catch (err) {
        console.error(`[ERROR] Errore nella lettura di ${USERS_FILE}:`, err);
    }

    // Controlla se l'utente esiste già
    if (users.some(user => user.username === username)) {
        console.log(`⚠️ L'utente ${username} esiste già!`);
        return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    users.push({ username, password: hashedPassword });

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log(`✅ Utente ${username} aggiunto con password sicura!`);
};

// Cambia username e password qui:
addUser('giacomo', 'password123');
addUser('sofia', 'wedding2025');
