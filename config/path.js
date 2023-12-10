import { fileURLToPath } from "url";
import path from "path";
import cookie from "cookie";

import { ensureAuthenticated } from "./auth.js";
import { getRootByOwner, get_parent_id_of_directory, get_name_of_directory } from "./queryDb.js";

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
    res.cookie("in_folder", true);
    //on recupere la racine de l'utilisateur pour la comparer au dossier courant pour savoir s'il est dans un dossier 
      const id_slash = await new Promise((resolve, reject) => {
        getRootByOwner(db, req.user.username, (err, id_slash) => {
          resolve(id_slash);
        });
      });
      if (cookie.parse(req.headers.cookie || "").current_dict == undefined) {
        res.cookie("current_dict", id_slash);
        res.cookie("current_path", "/");
        res.cookie("in_folder", false);
      }
      //si l'utilisateur à cliqué sur revenir en arrirère
      if (cookie.parse(req.headers.cookie || "").exit_folder == "true") {
        //on récupere l'id du répertoire parent
        const parent_id = await new Promise((resolve, reject) => {
          get_parent_id_of_directory(
            db,
            cookie.parse(req.headers.cookie || "").current_dict,
            (err, parent_id) => {
              resolve(parent_id);
            }
          );
        });
        //on applique ce parent comme le nouveau dossier courant
        res.cookie("current_dict", parent_id);
        res.cookie("exit_folder", false);
        //on diminue le chemin
        var path = cookie.parse(req.headers.cookie || "").current_path;
        path = path.split("/");
        path.pop();
        path.pop();
        path = path.join("/");
        res.cookie("current_path", path + "/");
        //si le dossier courant n'est pas le même que la racine de l'utilisateur, on est dans un dossier
        if (parent_id == id_slash) {
          res.cookie("in_folder", false);
        }
      }
      //si l'utilisateur à cliqué sur un dossier on augmente le chemin
      if (cookie.parse(req.headers.cookie || "").enter_folder == "true") {
        const name = await new Promise((resolve, reject) => {
          get_name_of_directory(
            db,
            cookie.parse(req.headers.cookie || "").current_dict,
            (err, name) => {
              resolve(name);
            }
          );
        });
        res.cookie("current_path", cookie.parse(req.headers.cookie || "").current_path + name + "/");
        res.cookie("enter_folder", false);
      }

      if (cookie.parse(req.headers.cookie || "").current_dict == id_slash) {
        res.cookie("in_folder", false);
      }

    //on envoie la page
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
      //détruit les cookies
      res.clearCookie("current_dict");
      res.clearCookie("current_path");
      // Redirigez l'utilisateur vers la page de connexion ou une autre page appropriée
      res.redirect("/");
    });
  });
}
