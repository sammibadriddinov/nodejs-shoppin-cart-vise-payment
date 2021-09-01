if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: ".env" });
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

console.log(stripeSecretKey, stripePublicKey);

const express = require("express");
const app = express();
const fs = require("fs");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
const stripe = require("stripe")(stripeSecretKey);

app.get("/store", function (req, res) {
  fs.readFile("data.json", function (e, data) {
    if (e) {
      res.status(500).end();
    } else {
      res.render("store.ejs", {
        stripePublicKey: stripePublicKey,
        data: JSON.parse(data),
      });
    }
  });
});

app.post("/purchase", function (req, res) {
  fs.readFile("data.json", function (e, data) {
    if (e) {
      res.status(500).end();
    } else {
      const itemsJson = JSON.parse(data);
      const itemsArray = itemsJson.mens.concat(itemsJson.women);
      let total = 0;
      req.body.items.forEach(function (item) {
        const itemJson = itemsArray.find(function (i) {
          return i.id == item.id;
        });
        total = total + itemJson.price * item.quantity;
      });

      stripe.charges
        .create({
          amount: total,
          source: req.body.stripeTokenId,
          currency: "usd",
        })
        .then(function () {
          console.log("Charge Succesfully");
          res.json({ message: "Succesfully purchased items" });
        })
        .catch(function () {
          console.log("Charge Fail");
          res.status(500).end();
        });
    }
  });
});

app.listen(5000, () => console.log("Server has been started on port 5000..."));
