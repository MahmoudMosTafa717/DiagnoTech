const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "DiagnoTech API",
    description: "DiagnoTech API - Description",
  },
  host: "localhost:5000",
};

const outputFile = "./swagger-output.json";
const routes = ["./server.js"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

// swaggerAutogen(outputFile, routes, doc);

swaggerAutogen(outputFile, routes, doc).then(() => {
  require("./server.js"); // Your project's root file
});
