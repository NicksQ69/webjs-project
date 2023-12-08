import { getDatabase } from "./database.js";

const [db, useless] = getDatabase();
export function addFile(){
    //ajoute un fichier dans la bd dans le dossier d'id 1
    db.run(
        "INSERT INTO files (parent_directory, name, file, owner) VALUES (?, ?, ?, ?)",
        [2, "yes", 0, "a"],
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

export function get_files(){
    //retourne les fichiers du dossier d'id 1
    db.all(
        "SELECT * FROM files WHERE parent_directory = ?",
        [1],
        (err, rows) => {
          if (err) {
            console.error(
              "Erreur lors de la récupération des fichiers :",
              err.message
            );
          } else {
            rows.forEach((row) => {
              console.log(row);
            });
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

export function deleteFileOrFolder(app, __storage, isFolder, owner, name, parent_directory){
    let source = isFolder ? "directories" : "files";
    
    const query = `DELETE FROM ${source} WHERE owner = ? AND name = ? AND parent_directory = ?`;
    const parameters = [owner, name, parent_directory];

    if(isFolder){
        // Récupération des fichiers contenu dans le dossier
        listFile = listFileOrFolderBySource(app, true, owner, parent_directory)
        
        for (const file in listFile) {
            fsPromises.rm(__storage+username+'/'+file)
        }

        // Supression récursives des sous dossiers 
        // TO DO
        
    }else{
        fsPromises.rm(__storage+username+'/'+name, (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log(name + " : Fichier supprimer avec succes !");
            }
        });
    }
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