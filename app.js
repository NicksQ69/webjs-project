import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bodyParser from "body-parser";

import { getAPI } from "./config/api.js";
import { getDatabase } from "./config/database.js";
import { getLogin } from "./config/login.js";
import { getPath } from "./config/path.js";
import { getUpload } from "./config/upload.js";

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

// ---- Gestion de l'API ----

getAPI(app,db);

// ---- Gestion des routes ----

getPath(app,db);

// ---- Gestion de l'upload ----

getUpload(app,db);

// ==============================================

// ---- Lancement du Serveur ----

// Le serveur écoute sur le port 3000 de Localhost
app.listen(3000, function () {
  console.log("Server listening on port 3000");
});
