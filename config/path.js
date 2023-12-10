import { listFileOrFolderBySource } from "./queryDb.js";
import { getRootByOwner } from "./queryDb.js";
import { add_file } from "./queryDb.js";
import { add_directory } from "./queryDb.js";
import { deleteFileOrFolder } from "./queryDb.js";
import { modifyFileOrFolder } from "./queryDb.js";
import { getIdOfDirectory } from "./queryDb.js";
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
  
  app.get("/api/new_file", ensureAuthenticated, async (req, res) => {
    //recupere le nom du fichier dans l'url
    const file_name = req.query.name;
    //si c'est un fichier on ajoute un fichier dans le dossier courant
    if (file_name.includes(".")){
      add_file(cookie.parse(req.headers.cookie || '').current_dict, file_name, req.user.username);
    }else{
      add_directory(cookie.parse(req.headers.cookie || '').current_dict, file_name, req.user.username);
    }
    res.redirect("back");
  });

  // Route permettant d'obtenir les fichier et dossier du dossier courant
  app.get("/api/dashboard", ensureAuthenticated, async (req, res) => {
    //obtient le nom du dossier courant
    const cookies = cookie.parse(req.headers.cookie || '');
    const id_current_dict = cookies.current_dict;
    
    //requête pour obtenir les fichiers du dossier racine de l'utilisateur
    const list_files = await new Promise((resolve, reject) => {
      listFileOrFolderBySource("files", id_current_dict, (err, list_files) => {
          resolve(list_files);
      });
    });

  // Route pour supprimer un fichier ou un dossier
  app.get("/delete_file", ensureAuthenticated, async (req, res) => {
    //obtient le nom du fichier ou dossier à supprimer depuis l'url
    var file_id = req.query.id;
    var type = "files"
    if (file_id.includes("d")){
      type = "directories";
    }
    file_id = file_id.replace(file_id[0], "");
    deleteFileOrFolder(file_id, type);
    res.redirect("back");
  });

    // Route pour modifier un fichier ou un dossier
    app.get("/modify_file", ensureAuthenticated, async (req, res) => {
      //obtient le nom du fichier ou dossier à modifier depuis le cookie file_to_modify
      var cookies = cookie.parse(req.headers.cookie || '');  
      var file_id = cookies.file_to_modify || 'Aucun ID trouvé';
      var file_new_name = cookies.new_name || 'Aucun ID trouvé';
      
      //termine les cookies
      res.clearCookie("file_to_modify");
      res.clearCookie("new_name");
      
      var type = "files"
      if (file_id.includes("d")){
        type = "directories";
      }
      file_id = file_id.replace(file_id[0], "");
      modifyFileOrFolder(file_id, type, file_new_name);
      res.redirect("back");
    });

    //requête pour obtenir les dossier du dossier racine de l'utilisateur
    const list_dict = await new Promise((resolve, reject) => {
      listFileOrFolderBySource("directories", id_current_dict, (err, list_dict) => {
          resolve(list_dict);
        });
      });
      res.json({"list_files": list_files, "list_dict": list_dict});
    });

  // Route vers le dashboard
  app.get("/dashboard", ensureAuthenticated, async (req, res) => {
    //requête pour obtenir l'id du dossier racine de l'utilisateur (en asyn avec promise question pratique)
      const id_slash = await new Promise((resolve, reject) => {
        getRootByOwner(req.user.username, (err, id_slash) => {
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
  app.get('/dashboard/:folder(*)', ensureAuthenticated, async (req, res) => {
  var cookies = cookie.parse(req.headers.cookie || '');  
  var id_current_dict = cookies.current_dict || 'Aucun ID trouvé';

  const folderPath = req.params.folder;
  const folders = folderPath.split('/');

  const id_dict = await new Promise((resolve, reject) => {
    getIdOfDirectory(id_current_dict, folders[folders.length - 1],(err, id_dict) => {
        resolve(id_dict);
    });
  });

  var current_path = "/";
  for (var i = 0; i < folders.length; i++) {
    current_path += folders[i] + "/";
  }

  if (id_dict != null){
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
