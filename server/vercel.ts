import 'dotenv/config';
import express from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./vite";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));

// Vercel-specific middleware and setup
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

(async () => {
  await registerRoutes(app);
  serveStatic(app);
})();

export default app;
