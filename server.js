import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectToDatabase } from "./models/db.js";
import Users from "./models/Users.js";
import Transaction from "./models/Transaction.js";



const app = express();
dotenv.config();


// Middleware
app.use(bodyParser.json());
connectToDatabase();

// Routes

// Test route
app.get("/home", (req, res) => {
  try {
    res.send({ message: "Hello" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Backup route
// app.post("/api/backup", async (req, res) => {
//   try {
//     const { users, transactions } = req.body;

//     await Users.deleteMany({});
//     await Transaction.deleteMany({});
//     await Users.insertMany(users);
//     await Transaction.insertMany(transactions);

//     res.status(200).json({ message: "✅ Backup saved successfully." });
//     console.log("✅ Backup saved successfully.");
//   } catch (error) {
//     console.error("❌ Backup error:", error);
//     res.status(500).json({ message: "Backup failed", error });
//   }
// });


app.post("/api/backup", async (req, res) => {
  try {
    const { users, transactions } = req.body;

    // Upsert users (assuming unique by email)
    const userOps = users.map(user => ({
      updateOne: {
        filter: { email: user.email },
        update: user,
        upsert: true,
      },
    }));
    await Users.bulkWrite(userOps);

    // Upsert transactions using _id
    const transactionOps = transactions.map(tx => ({
      updateOne: {
        filter: { _id: tx._id }, // Use MongoDB _id field here
        update: tx,
        upsert: true,
      },
    }));
    await Transaction.bulkWrite(transactionOps);

    res.status(200).json({ message: "✅ Backup saved successfully." });
    console.log("✅ Backup saved successfully.");
  } catch (error) {
    console.error("❌ Backup error:", error);
    res.status(500).json({ message: "Backup failed", error });
  }
});

// Restore route
app.get("/api/restore", async (req, res) => {
  try {
    const users = await Users.find({});
    const transactions = await Transaction.find({});

    res.status(200).json({ users, transactions });
    console.log("✅ Restore completed successfully.");
  } catch (error) {
    console.error("❌ Restore error:", error);

    // Send full error details (message and stack) in response for debugging
    res.status(500).json({
      message: "Restore failed",
      error: {
        message: error.message,
        stack: error.stack,
        // You can add more error details here if needed
      },
    });
  }
});


app.listen(process.env.PORT, ()=>{
    console.log(`Running on port ${process.env.PORT}`)
})