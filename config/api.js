import cookie from "cookie";

import { ensureAuthenticated } from "./auth.js";
import {
  listFileOrFolderBySource,
  add_file,
  add_directory,
  deleteFileOrFolder,
  modifyFileOrFolder,
} from "./queryDb.js";

export function getAPI(app, db) {
  // Créer une route pour récupérer les Users de la bd
  app.get("/api/getUsers", (req, res) => {
    const query = "SELECT * FROM users";
    db.all(query, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Créez le code HTML à renvoyer
      let html =
        "<!DOCTYPE html><html><head><title>Liste des utilisateurs</title></head><body>";
      html +=
        '<div id="dataContainer"><table><tr><th>Username</th><th>Password</th></tr>';

      rows.forEach((row) => {
        html += `<tr><td>${row.username}</td><td>${row.password}</td></tr>`;
      });

      html += "</table></div></body></html>";

      // Afficher les données dans la console
      console.log(rows);
      // Renvoyez le code HTML
      res.send(html);
    });
  });

  // Créer une route pour récupérer les Files de la bd
  app.get("/api/getFiles", (req, res) => {
    const query = "SELECT * FROM files";
    db.all(query, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Créez le code HTML à renvoyer
      let html =
        "<!DOCTYPE html><html><head><title>Liste des fichiers</title></head><body>";
      html +=
        '<div id="dataContainer"><table><tr><th>ID</th><th>Parent directory</th><th>Name</th><th>File</th></tr>';

      rows.forEach((row) => {
        html += `<tr><td>${row.id}</td><td>${row.directory}</td><td>${row.name}</td><td>${row.file}</td></tr>`;
      });

      html += "</table></div></body></html>";

      // Afficher les données dans la console
      console.log(rows);
      // Renvoyez le code HTML
      res.send(html);
    });
  });

  // Créer une route pour récupérer les Directories de la bd
  app.get("/api/getDirectories", (req, res) => {
    const query = "SELECT * FROM directories";
    db.all(query, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Créez le code HTML à renvoyer
      let html =
        "<!DOCTYPE html><html><head><title>Liste des répertoires</title></head><body>";
      html +=
        '<div id="dataContainer"><table><tr><th>ID</th><th>Parent directory</th><th>Name</th></tr>';

      rows.forEach((row) => {
        html += `<tr><td>${row.id}</td><td>${row.directory}</td><td>${row.name}</td></tr>`;
      });

      html += "</table></div></body></html>";

      // Afficher les données dans la console
      console.log(rows);
      // Renvoyez le code HTML
      res.send(html);
    });
  });

  app.get("/api/new_file", ensureAuthenticated, async (req, res) => {
    //recupere le nom du fichier dans l'url
    const file_name = req.query.name;
    //si c'est un fichier on ajoute un fichier dans le dossier courant
    if (file_name.includes(".")) {
      add_file(
        db,
        cookie.parse(req.headers.cookie || "").current_dict,
        file_name,
        req.user.username
      );
    } else {
      add_directory(
        db,
        cookie.parse(req.headers.cookie || "").current_dict,
        file_name,
        req.user.username
      );
    }
    res.redirect("back");
  });

  // Route permettant d'obtenir les fichier et dossier du dossier courant
  app.get("/api/dashboard", ensureAuthenticated, async (req, res) => {
    //obtient le nom du dossier courant
    const cookies = cookie.parse(req.headers.cookie || "");
    const id_current_dict = cookies.current_dict;

    //requête pour obtenir les fichiers du dossier racine de l'utilisateur
    const list_files = await new Promise((resolve, reject) => {
      listFileOrFolderBySource(
        db,
        "files",
        id_current_dict,
        (err, list_files) => {
          resolve(list_files);
        }
      );
    });

    // Route pour supprimer un fichier ou un dossier
    app.get("/delete_file", ensureAuthenticated, async (req, res) => {
      //obtient le nom du fichier ou dossier à supprimer depuis l'url
      var file_id = req.query.id;
      var type = "files";
      if (file_id.includes("d")) {
        type = "directories";
      }
      file_id = file_id.replace(file_id[0], "");
      deleteFileOrFolder(db, file_id, type);
      res.redirect("back");
    });

    // Route pour modifier un fichier ou un dossier
    app.get("/modify_file", ensureAuthenticated, async (req, res) => {
      //obtient le nom du fichier ou dossier à modifier depuis le cookie file_to_modify
      var cookies = cookie.parse(req.headers.cookie || "");
      var file_id = cookies.file_to_modify || "Aucun ID trouvé";
      var file_new_name = cookies.new_name || "Aucun ID trouvé";

      //termine les cookies
      res.clearCookie("file_to_modify");
      res.clearCookie("new_name");

      var type = "files";
      if (file_id.includes("d")) {
        type = "directories";
      }
      file_id = file_id.replace(file_id[0], "");
      modifyFileOrFolder(db, file_id, type, file_new_name);
      res.redirect("back");
    });

    //requête pour obtenir les dossier du dossier racine de l'utilisateur
    const list_dict = await new Promise((resolve, reject) => {
      listFileOrFolderBySource(
        db,
        "directories",
        id_current_dict,
        (err, list_dict) => {
          resolve(list_dict);
        }
      );
    });
    res.json({ list_files: list_files, list_dict: list_dict });
  });
}
