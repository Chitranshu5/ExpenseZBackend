import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  id: Number,
  userId: Number,
  userName: String,
  type: String,
  amount: Number,
  date: Date,
  description: String,
  category: String,
});

export default mongoose.model("Transaction", TransactionSchema);
