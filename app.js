import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import sqlite3 from 'sqlite3';
import session from 'express-session';
import bodyParser from 'body-parser';
import SQLiteStore from 'connect-sqlite3';
import fs from 'node:fs';
import bcrypt from 'bcrypt';

// Configuration de l'application Express pour traiter les données de formulaire
const app = express();

// Définition de la racine du projet et de la racine des fichier public
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __public = __dirname + "/public";

// Midleware
app.use(express.static(__public));
app.use(bodyParser.urlencoded({ extended: false }));


// ---- Routes ----

// Route vers la page principale
app.get('/', function (request, response) {
  response.sendFile(__public + "/login_page/login.html");
});

// Créer une route pour récupérer les Users de la bd
app.get('/api/getUsers', (req, res) => {
  const query = 'SELECT * FROM users';
  db.all(query, (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }

      // Créez le code HTML à renvoyer
      let html = '<!DOCTYPE html><html><head><title>Liste des utilisateurs</title></head><body>';
      html += '<div id="dataContainer"><table><tr><th>Username</th><th>Password</th></tr>';

      rows.forEach(row => {
          html += `<tr><td>${row.username}</td><td>${row.password}</td></tr>`;
      });

      html += '</table></div></body></html>';

      // Afficher les données dans la console
      console.log(rows)
      // Renvoyez le code HTML
      res.send(html);
  });
});


// Créer une route pour récupérer les Files de la bd
app.get('/api/getFiles', (req, res) => {
  const query = 'SELECT * FROM files';
  db.all(query, (err, rows) => {
    if (err) {
        res.status(500).json({ error: err.message });
        return;
    }

    // Créez le code HTML à renvoyer
    let html = '<!DOCTYPE html><html><head><title>Liste des fichiers</title></head><body>';
    html += '<div id="dataContainer"><table><tr><th>ID</th><th>Parent directory</th><th>Name</th><th>File</th></tr>';

    rows.forEach(row => {
        html += `<tr><td>${row.id}</td><td>${row.directory}</td><td>${row.name}</td><td>${row.file}</td></tr>`;
    });

    html += '</table></div></body></html>';

    // Afficher les données dans la console
    console.log(rows)
    // Renvoyez le code HTML
    res.send(html);
  });
});

// Créer une route pour récupérer les Directories de la bd
app.get('/api/getDirectories', (req, res) => {
  const query = 'SELECT * FROM directories';
  db.all(query, (err, rows) => {
    if (err) {
        res.status(500).json({ error: err.message });
        return;
    }

    // Créez le code HTML à renvoyer
    let html = '<!DOCTYPE html><html><head><title>Liste des répertoires</title></head><body>';
    html += '<div id="dataContainer"><table><tr><th>ID</th><th>Parent directory</th><th>Name</th></tr>';

    rows.forEach(row => {
        html += `<tr><td>${row.id}</td><td>${row.directory}</td><td>${row.name}</td></tr>`;
    });

    html += '</table></div></body></html>';

    // Afficher les données dans la console
    console.log(rows)
    // Renvoyez le code HTML
    res.send(html);
  });
});

// Ouverture du fichier html du formulaire de création d'un nouvel utilisateur
app.get('/create_user', function (request, response) {
  response.sendFile(__public + "/login_page/create_user.html");
});

// Création d'une connexion à la base de données SQLite

const db = new sqlite3.Database('database/database.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données :', err.message);
  } else {
    console.log('Connexion à la base de données réussie.');
  }
});

const sqliteStore = new SQLiteStore(session)({
  db: 'sessions.db',
  dir: __dirname + '/database',
  concurrentDB: true
});

// ---- Création d'un nouvel utilisateur ----

// Définition d'une route pour gérer la soumission de formulaire
app.post('/creer_utilisateur', async (req, res) => {
    // Récupération des données du formulaire à partir de la demande POST
    const username = req.body.username;
    const password = req.body.password.toString();

    // hashage du mot de passe
    const pwdHash = await bcrypt.hash(password, 10);

  // Insertion des données de l'utilisateur dans la base de données
  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],

    (err) => {
      if (err) {
        console.error('Erreur lors de la vérification du login :', err.message);
        res.redirect("/create_user");
      }
      if (row) {
        console.error('Login déja existant');
        res.cookie("user_creation", "Login déja existant");
        res.redirect("/create_user");
      }else{

        // Insertion de l'utilisateur dans la base de donnée avec son nom et son mot de passe hash
        db.run(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [username, pwdHash],
  
          (err) => {
              if (err) {
                  console.error('Erreur lors de l\'insertion de l\'utilisateur :', err.message);
                  res.cookie("user_creation", "Erreur lors de l\'insertion de l\'utilisateur :");
                  res.redirect('/');
              } else {
                  console.log('Utilisateur créé avec succès.');
                  res.cookie("user_creation", "Utilisateur créé avec succès.");
              }
          }
        );

        // Création du Dossier Source de l'utilisateur
        fs.mkdir(__public + '/storage/root_' + username, (error) => {
          if (error) {
            console.log(error);
          } else {
            console.log(username + " directory created successfully !!");
          }
        });
        
        // Insertion du dossier source de l'utilisateur dans la base de donnée
        db.run(
          'INSERT INTO directories (name, owner) VALUES (?, ?)',
          ['root_' + username, username],
  
          (err) => {
              if (err) {
                  console.error('Erreur lors de l\'insertion du Dossier :', err.message);
                  res.redirect('/');
              } else {
                  console.log('Dossier créé avec succès.');  
              }
              res.redirect('/');
          }
        );
      }
    }
  );
});


// ---- Gestion du login ----

app.use(
  session({
    secret: 'votre_secret',
    resave: false,
    saveUninitialized: true,
    store: sqliteStore,
    cookie: { maxAge: 6000000 } // 10 minutes en millisecondes
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  // Récupérez l'utilisateur à partir de la base de données en utilisant l'ID
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return done(err, null);
    }
    done(null, row); // L'utilisateur est désérialisé
  });
});

passport.use(new LocalStrategy(
  (username, password, done) => {
    console.log("La stratégie Passport est exécutée.");
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification du login :', err.message);
        return done(err);
      }
      if (!row) {
        console.log('Login inconnu');
        return done(null, false, { message: 'Login inconnu' });
      }
      
      // On compare le mot de passe saisie avec le mot de passe Hash
      try {
        const passwordMatch = await bcrypt.compare(password, row.password);
    
        if (!passwordMatch) {
          console.log('Mot de passe incorrect');
          return done(null, false, { message: 'Mot de passe incorrect' });
        } else {
          console.log('Login et mot de passe corrects');
          return done(null, row);
        }
      } catch (compareError) {
        console.error('Erreur lors de la comparaison des mots de passe :', compareError.message);
        return done(compareError);
      }
      
    });
  }
));

app.post('/login', (req, res, next) => {
  console.log('Route /login is reached');
  next(); // Continue with authentication
}, passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
}), (req, res) => {
  console.log('Authentication completed');
});

app.get('/logout', (req, res) => {
  // Détruit la session de l'utilisateur
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion :', err);
    } else {
      console.log('Utilisateur déconnecté');
    }
    // Redirigez l'utilisateur vers la page de connexion ou une autre page appropriée
    res.redirect('/');
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Si l'utilisateur est authentifié, continuez
    return next();
  }
  // Si l'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion
  res.cookie("authentification", "La session a expirée, veillez vous reconnecter")
  res.redirect('/');
}

app.get('/secret', ensureAuthenticated, function (req, res) {
  res.sendFile(__public + '/login_page/secret_page.html');
});

app.get('/dashboard', ensureAuthenticated, function (req, res) {
  res.sendFile(__public + '/dashboard_page/dashboard.html');
});

app.listen(3000, function () {
  console.log("Server listening on port 3000");
});