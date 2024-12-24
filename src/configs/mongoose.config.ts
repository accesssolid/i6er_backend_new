import mongoose from "mongoose";
import { DB } from "../constants/app.constant";
import dotenv from "dotenv";
import path from "path";
const envConfig = dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (envConfig.error) {
  throw new Error("No .Env File Found");
}

export const connection = async () => {

  const LOCAL_MONGO_URI = 'mongodb://i6eR_Dev:i6eR_1077@223.178.220.83/i6eR_Dev'
  const SERVER_MONGO_URI = 'mongodb://i6eR_Dev:i6eR_1077@localhost/i6eR_Dev'

  const MONGO_URI = process.env.ENV_MODE === 'DEV' ? SERVER_MONGO_URI : LOCAL_MONGO_URI;

  // const MONGO_URI = await DB.MONGODB_URI
  console.log(MONGO_URI, "URI_MONGO_URI_CONNECTION_SIDEE")
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


