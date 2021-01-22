const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      // Récupérer le token
      const token = req.headers.authorization.replace("Bearer ", "");

      // Chercher dans la BDD
      const user = await User.findOne({ token: token }).select(
        "account email token"
      );
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        req.user = user; // permet de créée une nouvelle clé user et de lui insérer la totalité du profil du user grâce à use = await User.findOne ---> A RECUPERER DANS LA ROUTE :D
        return next(); // fonction qui permet de passé à l'étape suivante dans la route ou isAuthenticated est appelé
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {}
};

module.exports = isAuthenticated;
