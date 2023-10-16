import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import sqlite3 from 'sqlite3';
import session from 'express-session';
import bodyParser from 'body-parser';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const __public = __dirname + "/public";

app.use(express.static(__public));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (request, response) {
  response.sendFile(__public + "/login_page/login.html");
});

const db = new sqlite3.Database('database/database.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données :', err.message);
  } else {
    console.log('Connexion à la base de données réussie.');
  }
});

app.use(
  session({
    secret: 'votre_secret',
    resave: false,
    saveUninitialized: true,
    store: mongoStore,
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