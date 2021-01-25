const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
// MODELS :
const User = require("../models/User");
const Offer = require("../models/Offer");
// MIDDLEWARE :
const isAuthenticated = require("../middleware/isAuthenticated");
// CLOUDINARY :
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_PUBLIC_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

router.get("/offers", async (req, res) => {
  try {
    let filter = {};

    //Si je reçois une query title
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    // -------------- Prix min
    if (req.query.priceMin) {
      filters.product_price = {
        $gte: Number(req.query.priceMin),
      };
    }

    if (req.query.priceMax) {
      if (filters.product_price)
        filters.product_price.$lte = Number(req.query.priceMax);
    } else {
      filters.product_price = {
        $lte: Number(req.query.priceMax),
      };
    }
    // -------------- Au prix max !

    let sort = {};
    // par ordre décroissant-croissant
    if (req.query.sort === "price-desc") {
      sort.product_price = -1;
    }
    if (req.query.sort === "price-asc") {
      sort.product_price = 1;
    }

    // Pour chercher le titre pantalon : http://localhost:3000/offers?title=pantalon
    // const offers = await Offer.find({
    //   product_name: new RegExp(req.query.title, "i"),
    // });

    // PAGINATION - A TERMINER , faire une boucle ?
    // const offers = await Offer.find()
    //   .skip(0)
    //   .limit(5)
    //   .select("product_name product_price");

    // // Pour chercher le titre pantalon et un prix max de 200 : http://localhost:3000/offers?title=pantalon&priceMax=200
    // const offers = await Offer.find({
    //   product_name: new RegExp(req.query.title, "i"),
    //   product_price: { $lte: req.query.priceMax },
    // }).select("product_name product_price");

    //Pour chercher un prix compris entre 40 et 200 : http://localhost:3000/offers?priceMin=40&priceMax=200
    // const offers = await Offer.find({
    //   product_price: {
    //     $gte: req.query.priceMin || 0,
    //     $lte: req.query.priceMax || 150000,
    //   },
    // }).select("product_name product_price");

    let page;
    // forcer à afficher la page1 si la query page n'est pas envoyée ou est envoyé avec 0 ou < -1
    if (req.query.page < 1) {
      page = 1;
    } else {
      // Sinon, page est égale à ce qui est demandé
      page = Number(req.query.page);
    }

    let limit = Number(req.query.limit);

    const offers = await Offer.find(filters)
      .sort(sort)
      .skip()
      .limit()
      .select("product_name product_price");

    if (offers.length > 0) {
      res.status(200).json(offers);
    } else {
      res.status(404).json({ message: "No offers" });
    }
    res.status(200).json(offers);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // // Je récup mon chemin "local" de la photo a uploder
    // const pictureToUpload = req.files.picture.path;
    // // Puis je save l'image dans cloudinary
    // let cloudUpload = await cloudinary.uploader.upload(pictureToUpload);
    // Crée un nouvel offer sans le picture pour le moment :
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ÉTAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      // Pour faire une réf je peux soit envoyer l'id, soit envoyer le document complet
      owner: req.user,
    });

    //Envoyer l'image à cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer.id}`,
    });
    //Sauvegarde la totalité de l'objet de l'image
    newOffer.product_image = result;

    await newOffer.save();

    res.status(200).json(newOffer);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// A TERMINER !!
router.put("/offer/update", isAuthenticated, async (req, res) => {
  try {
    await Offer.findOneAndUpdate(req.fields.id);
    // RECUPERE CHEMIN PICTURE
    const pictureToUpload = req.files.picture.path;
    let cloudUpload = await cloudinary.uploader.upload(pictureToUpload);
    // RECUPERE NOUVELLES DONNEES DE L'USER
    const offerUpload = mongoose.Types.ObjectId({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ÉTAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      product_image: {
        default: {},
        secure_url: cloudUpload.secure_url,
      },
      // Pour faire une réf je peux soit envoyer l'id, soit envoyer le document complet
      owner: req.user,
    });
    await offerUpload.save();
    res.status(200).json("Article bien updaté");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.fields.id);
    res.status(200).json("Article bien supprimé");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
