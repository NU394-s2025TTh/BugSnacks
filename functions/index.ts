const functions = require("firebase-functions/v1");
const express = require("express");

var routes = require("./routes");

const app = express();

app.use("/clock", routes.clock);
