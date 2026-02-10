import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

// Health check
app.get("/", (req, res) => {
  res.send("Lymon Payments API is running");
});

// Create payment
app.post("/pay", async (req, res) => {
  try {
    const { amount, email, reference } = req.body;

    const response = await axios.post(
      `${process.env.PAYCHANGU_BASE_URL}/payment`,
      {
        amount,
        email,
        reference,
        callback_url: `${process.env.FRONTEND_URL}/payment-success.php`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: "Payment failed",
      details: error.response?.data || error.message
    });
  }
});

// Webhook
app.post("/webhook", (req, res) => {
  const secret = req.headers["x-paychangu-signature"];

  if (secret !== process.env.PAYCHANGU_WEBHOOK_SECRET) {
    return res.status(401).send("Invalid webhook");
  }

  const payment = req.body;

  // Here later we notify PHP / update DB
  console.log("Payment confirmed:", payment);

  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
