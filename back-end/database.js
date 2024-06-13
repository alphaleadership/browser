const sqlite3 = require('sqlite3').verbose();

// Configuration de la base de données SQLite
const db = new sqlite3.Database('passwords.db');

// Création de la table de mots de passe si elle n'existe pas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT,
      username TEXT,
      password TEXT
    )
  `);
});

function savePassword(url, username, password) {
  db.run(`INSERT INTO passwords (url, username, password) VALUES (?, ?, ?)`, [url, username, password], (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Mot de passe sauvegardé');
  });
}

function getPasswords(url) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM passwords WHERE url = ?`, [url], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = { savePassword, getPasswords };
