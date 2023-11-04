export function getAPI(app,db) {
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
}
