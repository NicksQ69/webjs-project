import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bodyParser from "body-parser";

import { getAPI } from "./config/api.js";
import { getDatabase } from "./config/database.js";
import { getLogin } from "./config/login.js";

// =============== PARAM / CONFIG ===============

// Configuration de l'application Express pour traiter les données de formulaire
const app = express();

// Définition de la racine du projet et de la racine des fichier public
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __public = __dirname + "/public";

// Midleware
app.use(express.static(__public));
app.use(bodyParser.urlencoded({ extended: false }));

// Création d'une connexion à la base de données SQLite
const [db,sqliteStore] = getDatabase();

// ---- Gestion du login ----

getLogin(app,db,sqliteStore);

// ---- API ----

getAPI(app, db);

// ==============================================

// Ouverture du fichier html du formulaire de création d'un nouvel utilisateur
app.get("/create_user", function (request, response) {
  response.sendFile(__public + "/login_page/create_user.html");
});

app.get("/logout", (req, res) => {
  // Détruit la session de l'utilisateur
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la déconnexion :", err);
    } else {
      console.log("Utilisateur déconnecté");
    }
    // Redirigez l'utilisateur vers la page de connexion ou une autre page appropriée
    res.redirect("/");
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Si l'utilisateur est authentifié, continuez
    return next();
  }
  // Si l'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion
  res.cookie(
    "Authentification",
    "La session a expirée, veuillez vous reconnecter"
  );

  res.sendFile(__public + "/login_page/login.html");
}

// ---- Routes ----

// Route vers la page principale
app.get("/", ensureAuthenticated, (req, res) => {
  res.sendFile(__public + "/dashboard_page/dashboard.html");
});

// Ouverture du fichier html du formulaire de création d'un nouvel utilisateur
app.get("/create_user", function (request, response) {
  response.sendFile(__public + "/login_page/create_user.html");
});

// ---- Gestion du Upload ----

import { upload_settings } from "./config/upload.js";

app.use((req, res, next) => {
  if (req.url == "/upload") {
    const username = req.user.username;
    const upload = upload_settings(username);

    // Endpoint pour gérer l'upload des fichiers
    app.post(
      "/upload",
      ensureAuthenticated,
      upload.single("fileUpload"),
      (req, res) => {
        res.cookie("upload_status", "Fichier téléchargé avec succès");
        res.redirect("/");
      }
    );
  }

  next();
});

// ---- Lancement du Serveur ----

// Le serveur écoute sur le port 3000 de Localhost
app.listen(3000, function () {
  console.log("Server listening on port 3000");
});
