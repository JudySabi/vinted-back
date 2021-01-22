require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(formidable());
app.use(cors());

// BDD vinted
mongoose.connect(process.env.MONGODB_URI);

// ROUTES
const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

// ROUTES ALL & LISTEN
app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette page n'existe pas" });
});

app.listen(process.env.PORT, () => {
  console.log("Serveur lancé !");
});
