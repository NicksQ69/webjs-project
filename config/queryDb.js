import { getDatabase } from "./database.js";

const [db, useless] = getDatabase();

export function add_file(parent_directory, name, owner){
    //ajoute un fichier dans le bd
    db.run(
        "INSERT INTO files (parent_directory, name, file, owner) VALUES (?, ?, ?, ?)",
        [parent_directory, name, 0, owner],
        (err) => {
          if (err) {
            console.error(
              "Erreur lors de l'insertion du fichier :",
              err.message
            );
          } else {
            console.log("Fichier créé avec succès.");
          }
        }
    );
}

export function add_directory(parent_directory, name, owner){
    //ajoute un dossier dans le bd
    db.run(
        "INSERT INTO directories (parent_directory, name, owner) VALUES (?, ?, ?)",
        [parent_directory, name, owner],
        (err) => {
          if (err) {
            console.error(
              "Erreur lors de l'insertion du Dossier :",
              err.message
            );
          } else {
            console.log("Dossier créé avec succès.");
          }
        }
    );
}

/**
 * Liste les dossier ou les fichiers sous le dossier courant "parent_directory"
 * @param {*} app 
 * @param {*} isFolder true si on veux chercher les dossier faux si on veux chercher les fichiers
 * @param {*} owner nom de l'utilisateur propriétaire du dossier source
 * @param {*} parent_directory id du dossier parent
 */
export function listFileOrFolderBySource(isFolder, parent_directory, callback) {

    db.all(
        "SELECT * FROM "+isFolder+" WHERE parent_directory = ?",
        [parent_directory],
        (err, rows) => {
          if (err) {
            console.error(
              "Erreur lors de la récupération des fichiers :",
              err.message
            );
          } else {
            return callback(null, rows);
          }
        }
    );
}

export function modifyFileOrFolder(id, type, newName){
  db.all(
    "UPDATE "+type+" SET name = ? WHERE id = ?",
    [newName, id],
    (err, rows) => {
      if (err) {
        console.error(
          "Erreur lors de la modification",
          err.message
        );
      }
    });
}

export function deleteFileOrFolder(id, type){    
    db.all(
      "DELETE FROM "+type+" WHERE id = ?",
      [id],
      (err, rows) => {
        if (err) {
          console.error(
            "Erreur lors de la suppression",
            err.message
          );
        }
      }
  );
}

export function getIdOfDirectory(parent_directory, name_directory, callback){
  db.get(
      `SELECT id FROM directories WHERE parent_directory = ? AND name = ?`,
      [parent_directory, name_directory],
      async (err, row) => {
        if (err) {
          console.error(
            "Erreur lors du dossier",
            err.message
          );
          return done(err);
        }
        //cas où le dossier n'existe pas car on reste dans le dossier courant (via création de fichier par exemple)
        if (!row) {
          return callback(null, null);
        }else{
          //cas où le dossier existe car on a changé de dossier
          return callback(null, row.id);
        }
      }
  )
}

export function getRootByOwner(owner, callback){
    db.get(
        `SELECT id FROM directories WHERE owner = ? AND name = ?`,
        [owner, "root_" + owner],
        async (err, row) => {
          if (err) {
            console.error(
              "Erreur lors de la récupération de la racine :",
              err.message
            );
            return done(err);
          }
          if (!row) {
            console.log("Utilisateur "+owner+" inconnu");
            return done(null, false, { message: "Utilisateur "+owner+" inconnu" });
          }
          return callback(null, row.id);
        }
    )
}