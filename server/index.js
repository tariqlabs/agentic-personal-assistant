import express from "express";
import cors from "cors";
import { router } from "./routes/index.js";
import { config } from "./config/index.js";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.listen(config.server.port, () => {
  console.log(`🚀 Server running on port ${config.server.port}`);
});
