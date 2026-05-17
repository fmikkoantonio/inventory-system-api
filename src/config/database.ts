import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed", error);

    process.exit(1);
  }
};

export default connectDatabase;
