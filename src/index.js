require("dotenv").config();
const express = require("express");
const route = require("./routes/route");
const mongoose = require("mongoose");
const app = express();

const multer = require("multer");
app.use(multer().any());

app.use(express.json());

mongoose.connect(process.env.DATA_BASE, { useNewUrlParser: true }).then(() => {
  console.log("Database connected"), (error) => console.log(error);
});

app.use("/", route);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on Port " + Port);
});
