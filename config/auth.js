import { fileURLToPath } from "url";
import path from "path";

// Définition de la racine du projet et de la racine des fichier public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __public = path.resolve(__dirname, '../public');

export function ensureAuthenticated(req, res, next) {
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
