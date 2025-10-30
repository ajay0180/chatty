import mongoose from "mongoose";

export const connectDB = async (URI) => {
  try {
    await mongoose.connect(URI);
    console.log("successfully connected the database.");
  } catch (e) {
    console.log(e.message);
  }
};
