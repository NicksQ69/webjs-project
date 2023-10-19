import multer from "multer";
import path from "path";

export function upload_settings(username) {
  // Configuration de multer pour l'upload de fichiers
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "storage/root_" + username + "/");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  const upload = multer({ storage: storage });
  return upload;
}
