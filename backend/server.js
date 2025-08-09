import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import formRoutes from "./routes/formRoutes.js";
import displayRoutes from "./routes/displayRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 5050;
const MONGO_URL = "mongodb://localhost:27017/consultansease";

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Database connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
  }
};

app.use("/", formRoutes);
app.use("/", displayRoutes);
app.use("/", authRoutes);

startServer();
