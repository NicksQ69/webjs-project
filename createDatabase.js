// Import de la bibliotheque SQLite3
import sqlite3 from 'sqlite3';


// Connection à la base de données
const db = new sqlite3.Database('database/database.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données :', err.message);
  } else {
    console.log('Connexion à la base de données réussie.');
  }
});

  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT
    );
    `
  , (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table Users :', err.message);
    } else {
      console.log('Table Users créée avec succès.');
      db.run(
        `
        CREATE TABLE directories ( 
          id INTEGER PRIMARY KEY,
          parent_directory INT,
          name TEXT NOT NULL,
          owner TEXT NOT NULL,
          FOREIGN KEY(owner) REFERENCES users(username),
          FOREIGN KEY(parent_directory) REFERENCES directories(id)
        );
        `
      , (err) => {
        if (err) {
          console.error('Erreur lors de la création de la table Directories :', err.message);
        } else {
          console.log('Table Directories créée avec succès.');

          db.run(
            `
            CREATE TABLE files ( 
              id INTEGER PRIMARY KEY,
              parent_directory INT NOT NULL,
              name TEXT NOT NULL, 
              file BLOB NOT NULL,
              owner TEXT NOT NULL,
              size INT default 0,
              last_modified TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
              FOREIGN KEY(parent_directory) REFERENCES directories(id),
              FOREIGN KEY(owner) REFERENCES users(username)
            );
            `
          , (err) => {
            if (err) {
              console.error('Erreur lors de la création de la table Files :', err.message);
            } else {
              console.log('Table Files créée avec succès.');
              db.run(
                `
                CREATE TRIGGER IF NOT EXISTS update_last_modified
                AFTER UPDATE ON files
                FOR EACH ROW
                BEGIN
                    UPDATE files SET last_modified = strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime') WHERE id = NEW.id;
                END;
                `, (err) => {
                if (err) {
                    console.error("Erreur lors de la création du déclencheur", err.message);
                } else {
                    console.log("Déclencheur créé avec succès");
                }
            });
            }
          });
        }
      });
    }
  });