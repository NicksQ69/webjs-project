import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('database/database.db', (err) => {
    if (err) {
      console.error('Erreur lors de l\'ouverture de la base de données :', err.message);
    } else {
      console.log('Connexion à la base de données réussie.');
    }
  });

  db.run(
    //créer un user
    `
    INSERT INTO users (username, password) VALUES ('admin', 'admin');
    `       
    , (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table Users :', err.message);
    } else {
      console.log('Insertion avec succès.');
    }
    });

    db.run(
        //créer un user
        `
        INSERT INTO users (username, password) VALUES ('user', 'user');
        `       
        , (err) => {
        if (err) {
          console.error('Erreur lors de la création de la table Users :', err.message);
        } else {
          console.log('Insertion avec succès.');
        }
        });