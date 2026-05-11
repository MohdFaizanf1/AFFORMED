const app = require("./src/app");
const connectDB = require("./src/config/db");
const config = require("./src/config/config");

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.env}]`);
  });
};

startServer();
