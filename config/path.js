import { listFileOrFolderBySource } from "./queryDb.js";
import { getRootByOwner } from "./queryDb.js";
import { addFile } from "./queryDb.js";
import { get_files } from "./queryDb.js";
import { fileURLToPath } from "url";
import path from "path";

import { ensureAuthenticated } from "./auth.js";
import cookie from 'cookie';

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
  
  

  app.get("/api/dashboard", ensureAuthenticated, async (req, res) => {
    //obtient le nom du dossier courant
    const cookies = cookie.parse(req.headers.cookie || '');
    const id_current_dict = cookies.current_dict;
    console.log(id_current_dict)
    
    //requête pour obtenir les fichiers du dossier racine de l'utilisateur
    const list_files = await new Promise((resolve, reject) => {
      listFileOrFolderBySource("files", id_current_dict, (err, list_files) => {
          resolve(list_files);
      });
    });
    console.log("list fichiers",list_files)

    //requête pour obtenir les dossier du dossier racine de l'utilisateur
    const list_dict = await new Promise((resolve, reject) => {
      listFileOrFolderBySource("directories", id_current_dict, (err, list_dict) => {
          resolve(list_dict);
        });
      });
      console.log("list dossiers",list_dict)
      res.json({"list_files": list_files, "list_dict": list_dict});
    });

  // Route vers le dashboard
  app.get("/dashboard", ensureAuthenticated, async (req, res) => {
    addFile();
    //requête pour obtenir l'id du dossier racine de l'utilisateur (en asyn avec promise question pratique)
      const id_slash = await new Promise((resolve, reject) => {
        getRootByOwner(req.user.username, (err, id_slash) => {
            resolve(id_slash);
        });
      });
    
    //on mets les infos du / dans un cookie
    res.cookie("current_dict", id_slash);

    //on envoie la page
    res.sendFile(__public + "/dashboard_page/dashboard.html");
  });

  // Route dynamique pour les dossiers imbriqués
  app.get('/dashboard/:folder(*)', ensureAuthenticated, (req, res) => {
  
  const cookies = cookie.parse(req.headers.cookie || '');  
  const idCookieValue = cookies.id || 'Aucun ID trouvé';
  console.log(idCookieValue);
  
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
