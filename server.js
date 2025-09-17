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
// Restore route with ownerId filtering
app.get("/api/restore", async (req, res) => {
  try {
    // Assuming `ownerId` is passed as a query parameter (e.g., ?ownerId=965-886-6835)
    const { ownerId } = req.query;
    console.log("Restore request received for ownerId:", ownerId);

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required." });
    }

    // Fetch users where ownerId matches the query parameter
    const users = await Users.find({ ownerId });

    // Fetch transactions where ownerId matches the query parameter
    const transactions = await Transaction.find({ ownerId });

    // Handle case where no users or transactions are found
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found for the provided ownerId." });
    }

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found for the provided ownerId." });
    }

    // Send response with filtered data
    res.status(200).json({ users, transactions });
    console.log("Fetched transactions:", transactions);
    console.log("Fetched users:", users);

  } catch (error) {
    console.error("❌ Restore error:", error);

    // Send full error details (message and stack) in response for debugging
    res.status(500).json({
      message: "Restore failed",
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
});


app.listen(process.env.PORT, ()=>{
    console.log(`Running on port ${process.env.PORT}`)
})