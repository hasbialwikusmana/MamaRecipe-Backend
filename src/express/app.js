const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const xss = require("xss-clean");
const createError = require("http-errors");
const routes = require("./routes");

const app = express();

app.use(bodyParser.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(xss());
app.use(express.static("doc"));
app.use("/", routes);

app.all("*", (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
  });
});

module.exports = app;
