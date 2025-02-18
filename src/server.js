import dotenv from "dotenv";
import connectDB from "./db/dbConnection.js";
import { app } from "./app.js";

dotenv.config({
  path: ".env",
})

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is listen on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MOngodb connection failed !!! ", err);
  });