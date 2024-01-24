const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const compression = require("compression");
const cors = require("cors");
const xss = require("xss-clean");
const createError = require("http-errors");
const routes = require("./routes");

const app = express();

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(compression());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(xss());
app.use("/", routes);
app.use("img", express.static("src/upload"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Request-With, Content-Type, Accept, Authorization");
  next();
});

app.all("*", (req, res, next) => {
  next(new createError.NotFound());
});

app.use((err, req, res, next) => {
  const messError = err.message || "Internal Server Error";
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    message: messError,
  });
});

module.exports = app;
