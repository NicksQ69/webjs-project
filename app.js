import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import sqlite3 from 'sqlite3';
import session from 'express-session';
import bodyParser from 'body-parser';
import SQLiteStore from 'connect-sqlite3';

const app = express();

// Configuration de l'application Express pour traiter les données de formulaire

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const __public = __dirname + "/public";

app.use(express.static(__public));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (request, response) {
  response.sendFile(__public + "/login_page/login.html");
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
  dir: __dirname + '/database', // Assurez-vous que le répertoire existe
  concurrentDB: true
});

// ---- Création d'un utilisateur ----

// Ouverture du fichier html du formulaire
app.get('/create_user'), (request, response) => {
  response.sendFile(__public + "/login_page/create_user.html");
};

// Définition d'une route pour gérer la soumission de formulaire
app.post('/creer_utilisateur', (req, res) => {
    // Récupération des données du formulaire à partir de la demande POST
    const username = req.body.username;
    const password = req.body.password;

    console.log(username, password);

    // Insertion des données de l'utilisateur dans la base de données
    db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password],

        (err) => {
            if (err) {
                console.error('Erreur lors de l\'insertion de l\'utilisateur :', err.message);
                res.cookie("user_creation", "Erreur lors de l\'insertion de l\'utilisateur :");
                res.redirect("/");
            } else {
                console.log('Utilisateur créé avec succès.');
                res.cookie("user_creation", "Utilisateur créé avec succès.");
                res.redirect("/");
            }
        }
    );
});


// ---- Gestion login ----


app.use(
  session({
    secret: 'votre_secret',
    resave: false,
    saveUninitialized: true,
    store: sqliteStore,
    cookie: { maxAge: 1000 } // 10 minutes en millisecondes
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
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        console.error('Erreur lors de la vérification du login :', err.message);
        return done(err);
      }
      if (!row) {
        console.log('Login inconnu');
        return done(null, false, { message: 'Login inconnu' });
      }
      if (row.password != password) {
        console.log('Mot de passe incorrect');
        return done(null, false, { message: 'Mot de passe incorrect' });
      }
      console.log('Login et mot de passe corrects');
      return done(null, row);
    });
  }
));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Si l'utilisateur est authentifié, continuez
    return next();
  }
  // Si l'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion
  res.redirect('/');
}


app.post('/login', (req, res, next) => {
  console.log('Route /login is reached');
  next(); // Continue with authentication
}, passport.authenticate('local', {
  successRedirect: '/secret',
  failureRedirect: '/',
}), (req, res) => {
  console.log('Authentication completed');
});

app.get('/secret', ensureAuthenticated, function (req, res) {
  res.sendFile(__public + '/login_page/secret_page.html');
});

app.listen(3000, function () {
  console.log("Server listening on port 3000");
});