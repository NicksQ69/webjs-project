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
          id INT AUTO_INCREMENT PRIMARY KEY,
          directory INT NOT NULL,
          name TEXT NOT NULL, 
          FOREIGN KEY(directory) REFERENCES directories(id)
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
              id INT AUTO_INCREMENT PRIMARY KEY,
              directory INT NOT NULL,
              name TEXT NOT NULL, 
              file BLOB NOT NULL,
              FOREIGN KEY(directory) REFERENCES directories(id)
            );
            `
          , (err) => {
            if (err) {
              console.error('Erreur lors de la création de la table Files :', err.message);
            } else {
              console.log('Table Files créée avec succès.');
            }
          });
        }
      });
    }
  });

  

  

