require("dotenv").config();
const express = require("express");
const route = require("./routes/route");
const mongoose = require("mongoose");
const app = express();

const multer = require("multer");
const Port = process.env.PORT;
app.use(multer().any());

app.use(express.json());

mongoose.connect(process.env.DATA_BASE, { useNewUrlParser: true }).then(() => {
  console.log("Database connected"), (error) => console.log(error);
});

app.use("/", route);

app.listen(Port, () => {
  console.log("Server running on Port " + Port);
});
