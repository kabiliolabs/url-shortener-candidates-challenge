import "dotenv/config";
import express from "express";
import { shutdown } from "./db.js";
import { corsMiddleware } from "./middleware/cors.js";
import { shortLinkRouter } from "./routes/shortLinks.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(corsMiddleware);
app.use(express.json());
app.use(shortLinkRouter);

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
