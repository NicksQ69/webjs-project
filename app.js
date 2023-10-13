// Import des bibliothèques
const express = require('express');
const { Database } = require('sqlite3');
const sqlite3 = require('sqlite3'.verbose());

const app = express()

// Configuration de l'application Express pour traiter les données de formulaire
app.use(express.urlencoded({ extended: false}));

// Création d'une connection à la base de donnée SQLite
const db = new sqlite3.Database(Database/database.db, err => {
    if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données :', err.message);
    }else{
        console.log('Connexion à la base de donnée réussie.');
    }
});


// ---- Creation d'un utilisateur ----

// Définition d'une route pour gérer la soumission de formulaire
app.post('/creer-utilisateur', (req, res) => {
    // Récupération des données du formulaire à partir de la demande POST
    const username = req.body.username;
    const password = req.body.password;

    // Insertion des données de l'utilisateur dans la base de donnée
    db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password],
        
        (err) => {
            if (err) {
                console.error('Erreur lors de l\'insertion de l\'utilisateur :', err.message);
                res.send('Erreur lors de la création de l\'utilisateur.');
            } else {
                console.log('Utilisateur crée avec succès.');
                res.send('Utilisateur créé avec succès.')
            }
        }
    );
});

// Lancement du serveur sur le port 3000
app.listen(3000, () => {
    console.log('Serveur en cours d\'écoute sur le port 3000');
});