const express = require("express");
const route = require("./routes/route");
const mongoose = require("mongoose");
const app = express();
const multer = require('multer')
app.use(multer().any())

app.use(express.json());

mongoose
  .connect("mongodb+srv://santosh:Santosh24@cluster0.xy0vu.mongodb.net/groupDatabase66?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  ).then(() => { console.log("Database connected"), (error) => console.log(error); });

app.use("/", route);

app.listen(process.env.Port || 3000, () => {
  console.log("Server running on Port " + (process.env.Port || 3000));
});