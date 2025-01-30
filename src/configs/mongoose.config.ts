import mongoose from "mongoose";
// import { DB } from "../constants/app.constant";
import dotenv from "dotenv";
import path from "path";
import { AWS_CREDENTIAL, DB } from "../constants/app.constant";
const envConfig = dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (envConfig.error) {
  throw new Error("No .Env File Found");
}

export const connection = async () => {
  const MONGO_URI = await DB.MONGODB_URI

  mongoose.Promise = global.Promise;

  await mongoose.connect(MONGO_URI as string, {} as mongoose.ConnectOptions)

  const db = mongoose.connection;

  db.once('open', () => {
    console.log("connection established", MONGO_URI);
  });

  db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });


}


