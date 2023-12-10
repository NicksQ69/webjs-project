import { fileURLToPath } from "url";
import path from "path";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import fs from "fs";

// Définition de la racine du projet et de la racine des fichier public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __storage = path.resolve(__dirname, "../public/storage/root_");

export function getLogin(app, db, sqliteStore) {
  // =============== PARAM / CONFIG ===============

  app.use(
    session({
      secret: "votre_secret",
      resave: false,
      saveUninitialized: true,
      store: sqliteStore,
      cookie: { maxAge: 1000 * 60 * 60 },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser((username, done) => {
    // Récupérez l'utilisateur à partir de la base de données en utilisant l'ID
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        return done(err, null);
      }
      done(null, row); // L'utilisateur est désérialisé
    });
  });

  passport.use(
    new LocalStrategy((username, password, done) => {
      console.log("La stratégie Passport est exécutée.");
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, row) => {
          if (err) {
            console.error(
              "Erreur lors de la vérification du login :",
              err.message
            );
            return done(err);
          }
          if (!row) {
            console.log("Login inconnu");
            return done(null, false, { message: "Login inconnu" });
          }

          // On compare le mot de passe saisie avec le mot de passe Hash
          try {
            const passwordMatch = password == row.password;

            if (!passwordMatch) {
              console.log("Mot de passe incorrect");
              return done(null, false, { message: "Mot de passe incorrect" });
            } else {
              console.log("Login et mot de passe corrects");
              return done(null, row);
            }
          } catch (compareError) {
            console.error(
              "Erreur lors de la comparaison des mots de passe :",
              compareError.message
            );
            return done(compareError);
          }
        }
      );
    })
  );

  // =============== APP.POST ===============

  app.post(
    "/login",
    (req, res, next) => {
      console.log("Route /login is reached");
      next(); // Continue with authentication
    },
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/",
    }),
    (req, res) => {
      console.log("Authentication completed");
    }
  );

  // ---- Création d'un nouvel utilisateur ----

  // Définition d'une route pour gérer la soumission de formulaire
  app.post("/create_user", async (req, res) => {
    // Récupération des données du formulaire à partir de la demande POST
    const username = req.body.username;
    const password = req.body.password.toString();

    // Insertion des données de l'utilisateur dans la base de données
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, row) => {
        if (err) {
          console.error(
            "Erreur lors de la vérification du Username :",
            err.message
          );
          res.redirect("/create_user");
        }
        if (row) {
          console.error("Login déjà existant");
          res.cookie("user_creation", "Login déja existant");
          res.redirect("/create_user");
        } else {
          // Insertion de l'utilisateur dans la base de donnée avec son nom et son mot de passe hash
          db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, password],

            (err) => {
              if (err) {
                console.error(
                  "Erreur lors de l'insertion de l'utilisateur :",
                  err.message
                );
                res.cookie(
                  "user_creation",
                  "Erreur lors de l'insertion de l'utilisateur :"
                );
                res.redirect("/");
              }
              // Création du Dossier Source de l'utilisateur
              fs.mkdir(__storage + username, (error) => {
                if (error) {
                  console.log(error);
                } else {
                  console.log(username + " directory created successfully !!");
                }
              });

              // Insertion du dossier source de l'utilisateur dans la base de donnée
              db.run(
                "INSERT INTO directories (name, owner) VALUES (?, ?)",
                ["root_" + username, username],

                (err) => {
                  if (err) {
                    console.error(
                      "Erreur lors de l'insertion du Dossier :",
                      err.message
                    );
                    res.redirect("/");
                  } else {
                    console.log("Dossier créé avec succès.");
                  }
                  res.redirect("/");
                }
              );
              console.log("Utilisateur créé avec succès.");
              res.cookie("user_creation", "Utilisateur créé avec succès.");
            }
          );
        }
      }
    );
  });
}
