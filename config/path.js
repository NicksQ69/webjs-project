import { fileURLToPath } from "url";
import path from "path";
import cookie from "cookie";

import { ensureAuthenticated } from "./auth.js";
import { getRootByOwner, getIdOfDirectory } from "./queryDb.js";

// Définition de la racine du projet et de la racine des fichier public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __public = path.resolve(__dirname, "../public");

export function getPath(app, db) {
  // ---- Routes ----

  // Route vers la page principale
  app.get("/", ensureAuthenticated, (req, res) => {
    res.redirect("/dashboard");
  });

  // Route vers le dashboard
  app.get("/dashboard", ensureAuthenticated, async (req, res) => {
    //requête pour obtenir l'id du dossier racine de l'utilisateur (en asyn avec promise question pratique)
    const id_slash = await new Promise((resolve, reject) => {
      getRootByOwner(db, req.user.username, (err, id_slash) => {
        resolve(id_slash);
      });
    });

    //on mets les infos du / dans un cookie
    res.cookie("current_dict", id_slash);
    res.cookie("current_path", "/");
    res.cookie("in_folder", false);
    //on envoie la page
    res.sendFile(__public + "/dashboard_page/dashboard.html");
  });

  // Route dynamique pour les dossiers imbriqués
  app.get("/dashboard/:folder(*)", ensureAuthenticated, async (req, res) => {
    var cookies = cookie.parse(req.headers.cookie || "");
    var id_current_dict = cookies.current_dict || "Aucun ID trouvé";

    const folderPath = req.params.folder;
    const folders = folderPath.split("/");

    const id_dict = await new Promise((resolve, reject) => {
      getIdOfDirectory(
        db,
        id_current_dict,
        folders[folders.length - 1],
        (err, id_dict) => {
          resolve(id_dict);
        }
      );
    });

    var current_path = "/";
    for (var i = 0; i < folders.length; i++) {
      current_path += folders[i] + "/";
    }

    if (id_dict != null) {
      res.cookie("current_dict", id_dict);
    }
    res.cookie("current_path", current_path);
    res.cookie("in_folder", true);
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
