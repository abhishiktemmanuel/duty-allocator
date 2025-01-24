require("dotenv").config();
const express = require("express");
const app = express();
const port = 0;

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`);
});
