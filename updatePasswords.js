const fs = require('fs');
const bcrypt = require('bcrypt');

const USERS_FILE = 'users.json';

const updatePasswords = async () => {
    let users = [];
    
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        users = JSON.parse(data);
    } catch (err) {
        console.error(`[ERROR] Errore nella lettura di ${USERS_FILE}:`, err);
        return;
    }

    let updated = false;
    
    for (let user of users) {
        if (!user.password.startsWith('$2b$')) { // Controlla se è già hashata
            console.log(`🔄 Aggiornamento password per ${user.username}...`);
            user.password = await bcrypt.hash(user.password, 10);
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        console.log(`✅ Password aggiornate correttamente in ${USERS_FILE}`);
    } else {
        console.log(`✅ Tutte le password erano già hashate.`);
    }
};

updatePasswords();
