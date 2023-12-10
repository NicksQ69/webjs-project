import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import { add_file_with_size } from "./queryDb.js";
import cookie from 'cookie';

import { ensureAuthenticated } from "./auth.js";

// Définition de la racine du projet et de la racine des fichier public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __storage = path.resolve(__dirname, '../public/storage/root_');

function upload_settings(db,username) {
  // Configuration de multer pour l'upload de fichiers
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __storage + username + "/");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        Date.now() + file.originalname
      );
    },
  });

  const upload = multer({ storage: storage });
  return upload;
}

export function getUpload(app,db) {
  app.use((req, res, next) => {
    if (req.url == "/upload") {
      const username = req.user.username;
      const upload = upload_settings(db,username);

      // Endpoint pour gérer l'upload des fichiers
      app.post(
        "/upload",
        ensureAuthenticated,
        upload.single("fileUpload"),
        (req, res) => {
          add_file_with_size(db,cookie.parse(req.headers.cookie || '').current_dict, req.file.originalname, username, req.file.size);
          res.cookie("upload_status", "Fichier téléchargé avec succès");
          res.redirect("/");
        }
      );
    }

    next();
  });
}
