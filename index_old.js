const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
const app = express();
const axios = require('axios')
const authString = true
  ? "MeCHHkZ9:tdypsA =:lqBZghxJgaVE"
  : "lRRqlkYefuV=:lRRqlkYefuV6jJ==:qzOUsBmZFgMDlwGtrgYypxUz";
const consolere = require('console-remote-client').connect({ server: 'https://console.re', channel: 'icms' });
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, useNewUrlParser: true, parameterLimit: 50000, limit: "50mb" }));
mongoose
  .connect("mongodb://verveuser:vervebot123@44.203.89.214/vervedb", {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then((res) => console.log("success connecting to mongo"))
  .catch((err) => console.log(err));
const Schema = mongoose.Schema;
const posSchema = new Schema({
  SKU: String,
  UPC: String,
  ALTUPC1: String,
  ALTUPC2: String,
  ItemName: String,
  Vintage: String,
  TotalQty: String,
  Cost: String,
  PriceA: String,
  PriceB: String,
  PriceC: String,
  Department: String,
  SALEPRICE: String,
  SizeName: String,
  PackName: String,
  Price: String,
  STORECODE: String,
  soldQty: { type: String, default: "0" },
  wordpressSoldQty: { type: String, default: "0" },
  invoiceQty: { type: String, default: "0" },
});




app.listen(3001, () => {
  console.log(`Server Running`);
});
