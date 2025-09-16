import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  id: Number,
  name: String,
  email: String,
  phone: String,
  ownerId: String, // Reference to the owner user
});

export default mongoose.model("User", UserSchema);
