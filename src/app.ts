import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import photoRoutes from "./routes/photoRoutes";
import colorRoutes from "./routes/colorRoutes"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/colors", colorRoutes)

app.get("/", (req, res) => {
  res.send("API is running!");
});

export default app;
