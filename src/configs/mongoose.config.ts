import mongoose from "mongoose";
import { DB } from "../constants/app.constant";

export const connection = async () => {

  const MONGO_URI = 'mongodb://i6eR_Dev:i6eR_1077@localhost/i6eR_Dev'
  // const MONGO_URI = await DB.MONGODB_URI
  console.log(MONGO_URI, "MONGO_URI_CONNECTION_SIDE")
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


