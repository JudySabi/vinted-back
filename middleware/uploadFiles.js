const User = require("../models/User");
const Offer = require("../models/Offer");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dnypnz3xt",
  api_key: "369314657779522",
  api_secret: "xriR_YvDFzeaXm8s2hbG6NFQFxM",
});

const uploadFiles = async (req, res) => {
  const tokenToTest = req.headers.authorization.replace("Bearer ", "");
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: tokenToTest,
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = user; // permet de créée une nouvelle clé user et de lui insérer la totalité du profil du user grâce à use = await User.findOne ---> A RECUPERER DANS LA ROUTE :D
      return next(); // fonction qui permet de passé à l'étape suivante dans la route ou isAuthenticated est appelé
    }
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = uploadFiles;
