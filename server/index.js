import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import "dotenv/config";
import routes from "./src/routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let cachedDb = null;

const connectDb = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URL, {
    bufferCommands: false,
  });

  cachedDb = connection;
  return connection;
};

app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/v1", routes);

const port = process.env.PORT || 5000;

// Local / non-Vercel: start HTTP server after DB connects
if (!process.env.VERCEL) {
  connectDb()
    .then(() => {
      console.log("Mongodb connected");
      http.createServer(app).listen(port, () => {
        console.log(`Server is listening on port ${port}`);
      });
    })
    .catch((err) => {
      console.log({ err });
      process.exit(1);
    });
}

export default app;
