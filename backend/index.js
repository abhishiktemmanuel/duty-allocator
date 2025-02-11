require("dotenv").config();
const express = require("express");
const job = require("./corn.js");
const app = express();
const port = 0;

job.start();
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`);
});
