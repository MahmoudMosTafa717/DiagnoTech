const express = require("express");
const app = express();
app.get("/", () => {});
const port = 4000;
app.listen(port, () => {
  console.log(`server listens on port ${port}`);
});
