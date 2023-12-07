import { fileURLToPath } from "url";
import path from "path";

import { ensureAuthenticated } from "./auth.js";

// Définition de la racine du projet et de la racine des fichier public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __public = path.resolve(__dirname, '../public');

export function getPath(app) {
  // ---- Routes ----

  // Route vers la page principale
  app.get("/", ensureAuthenticated, (req, res) => {
    res.redirect("/dashboard");
  });
  
  // Route vers le dashboard
  app.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.sendFile(__public + "/dashboard_page/dashboard.html");
  });

  // Route dynamique pour les dossiers imbriqués
  app.get('/dashboard/:folder(*)', ensureAuthenticated, (req, res) => {
  const folderPath = req.params.folder;
  const folders = folderPath.split('/');
  console.log(folders)
  //found_dict_id(req.user.username, folders);
  res.sendFile(__public + "/dashboard_page/dashboard.html");
});

  // Route pour la création d'un nouvel utilisateur
  app.get("/create_user", function (request, response) {
    response.sendFile(__public + "/login_page/create_user.html");
  });

  // Route pour déconnecter l'utilisateur
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
}
