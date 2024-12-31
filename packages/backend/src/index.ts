import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { rateLimit } from "express-rate-limit";
import notesRouter from "./routes/notes";
import { swaggerSpec } from "./swagger";
import path from "path";

const app = express();
const HOST = process.env.HOST || "127.0.0.1";
const PORT = parseInt(process.env.PORT || "4500", 10);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(
  cors({
    origin: "http://127.0.0.1:4600", // Frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(limiter);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/notes", notesRouter);

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
  console.log(
    `Swagger documentation available at http://${HOST}:${PORT}/api-docs`
  );
});
