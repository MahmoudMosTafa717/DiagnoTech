const express = require("express");
const app = express();
app.get("/", () => {});
app.listen(port, () => {
  console.log(`server listens on port ${port}`);
});
