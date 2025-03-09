import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import photoRoutes from "./routes/photoRoutes";
import colorRoutes from "./routes/colorRoutes"
import palettesRoutes from "./routes/palettesRoutes"
import authRoutes from "./routes/authRoutes"
import { swaggerOptions } from "./config/swagger";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { SwaggerTheme } from "swagger-themes";

dotenv.config();

const app = express();

const specs = swaggerJSDoc(swaggerOptions);
const swaggerTheme = new SwaggerTheme();
const darkTheme = swaggerTheme.getBuffer("dark" as any);

app.use(cors());
app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: darkTheme,
  })
);
app.use("/api/", authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/palettes", palettesRoutes)

app.get("/", (req, res) => {
  res.send("API is running!");
});

export default app;
