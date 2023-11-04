import { fileURLToPath } from "url";
import path from "path";
import sqlite3 from "sqlite3";
import SQLiteStore from "connect-sqlite3";
import session from "express-session";

// Définition de la racine du projet et de la racine des fichier public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __database = path.resolve(__dirname, '../database');

export function getDatabase() {
  // Création d'une connexion à la base de données SQLite
  const db = new sqlite3.Database("database/database.db", (err) => {
    if (err) {
      console.error(
        "Erreur lors de l'ouverture de la base de données :",
        err.message
      );
    } else {
      console.log("Connexion à la base de données réussie.");
    }
  });

  const sqliteStore = new SQLiteStore(session)({
    db: "sessions.db",
    dir: __database,
    concurrentDB: true,
  });

  return [db, sqliteStore];
}
