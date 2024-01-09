const express = require("express");
const cors = require("cors");
const xss = require("xss-clean");
const createError = require("http-errors");
const mainRouter = require("./routes/index");
const PORT = process.env.PORT || 3000;
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(xss());
app.use(express.static("public"));

app.use("/", mainRouter);
app.all("*", (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
