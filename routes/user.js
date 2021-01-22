const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
// MODELS :
const User = require("../models/User");
const Offer = require("../models/Offer");
// CLOUDINARY
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dnypnz3xt",
  api_key: "369314657779522",
  api_secret: "xriR_YvDFzeaXm8s2hbG6NFQFxM",
});

// ------------------------- SIGNUP ---------------------------
router.post("/user/signup", async (req, res) => {
  try {
    // s'il me retourne qqchose -> retourne un objet
    const userEmail = await User.findOne({ email: req.fields.email });

    // si !userEmail est undefined, false, "", 0 :
    if (!userEmail) {
      if (req.fields.email && req.fields.username && req.fields.password) {
        // --- HASHAGE DU MDP
        const password = req.fields.password; //mot de passe rentré par l'utilisateur
        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(64);

        if (req.files.avatar) {
          // Si un avatar existe
          //  --- RECUP AVATAR
          const pictureToUpload = req.files.avatar.path; //Je récup mon chemin "local" de la photo a uploder
          let cloudUpload = await cloudinary.uploader.upload(pictureToUpload); // Puis je save l'image dans cloudinary
          console.log(cloudUpload);
        }
        // --- CREATION DU NOUVEAU USER
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
            avatar: cloudUpload.secure_url,
          },
          token: token,
          hash: hash,
          salt: salt,
        });
        // Save et répond à l'utilisateur
        await newUser.save();

        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
            phone: newUser.account.phone,
            avatar: newUser.account.avatar,
          },
        });
      } else {
        res
          .status(400)
          .json("Votre username doit contenir au moins un charactère");
      }
    } else {
      res
        .status(400)
        .json("Cet email existe déjà dans notre base de données !");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ------------------------- LOGIN ---------------------------
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    const password = req.fields.password;
    const newHash = SHA256(password + user.salt).toString(encBase64);
    if (user && newHash === user.hash) {
      res.status(200).json({
        _id: user._id,
        token: user.token,
        account: {
          username: user.account.username,
          phone: user.account.phone,
        },
      });
    } else {
      res.status(400).json("L'email ou le password n'est pas bon");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
