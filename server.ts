import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/payment/orange", async (req, res) => {
    const { amount, phone_number, plan } = req.body;
    
    // Check if Orange Money real credentials exist
    if (process.env.ORANGE_MONEY_CLIENT_ID && process.env.ORANGE_MONEY_CLIENT_SECRET) {
      try {
        console.log(`[Orange Money - LIVE] Initiating payment of NLE ${amount}`);
        // 1. Get Bearer Token
        const tokenRes = await fetch("https://api.orange.com/oauth/v3/token", {
          method: "POST",
          headers: {
            "Authorization": "Basic " + Buffer.from(`${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          },
          body: "grant_type=client_credentials"
        });
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // 2. Initiate Web Payment or Direct Payment Request
        const paymentRes = await fetch("https://api.orange.com/orange-money-webpay/dev/v1/webpayment", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
            currency: "SLL", // standard currency code
            order_id: `ORDER-${Date.now()}`,
            amount: amount,
            return_url: `${process.env.APP_URL || "http://localhost:3000"}/success`,
            cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/cancel`,
            notif_url: `${process.env.APP_URL || "http://localhost:3000"}/api/webhooks/orange`,
            lang: "en",
            reference: `UPGRADE-${plan}`
          })
        });

        const paymentData = await paymentRes.json();
        
        // This usually returns a payment_url to redirect the user, or processes directly
        return res.json({ 
          success: true, 
          // If using web pay, redirect the user here:
          payment_url: paymentData.payment_url, 
          transaction_id: paymentData.notif_token 
        });

      } catch (error) {
        console.error("[Orange Money Error]", error);
        return res.status(500).json({ success: false, message: "Orange Money API failure" });
      }
    }

    // FALLBACK for Local/Preview dev without credentials
    console.log(`[Orange Money - MOCK] Processing payment of NLE ${amount} for phone +232${phone_number} (Plan: ${plan})`);
    setTimeout(() => {
        res.json({ success: true, message: "Orange Money payment successful (MOCK)", transaction_id: `OM-${Date.now()}` });
    }, 1500);
  });

  // Webhook to receive confirmation from Orange when payment succeeds
  app.post("/api/webhooks/orange", (req, res) => {
    const { status, notif_token, txnid } = req.body;
    console.log(`[Orange Webhook] Payment received: Status=${status}, TXN=${txnid}`);
    
    // In a real app:
    // 1. Verify webhook signature if applicable
    // 2. Update the user's listing to 'premium' in the database
    // 3. Mark transaction as completed

    res.status(200).send("OK");
  });

  app.post("/api/payment/afrimoney", (req, res) => {
    const { amount, phone_number, plan } = req.body;
    // Simulate Afrimoney API interaction
    console.log(`[AfriMoney] Processing payment of NLE ${amount} for phone +232${phone_number} (Plan: ${plan})`);
    
    setTimeout(() => {
        res.json({ success: true, message: "AfriMoney payment successful", transaction_id: `AF-${Date.now()}` });
    }, 1500);
  });

  app.post("/api/payment/card", (req, res) => {
    const { amount, plan } = req.body;
    // Simulate Stripe/Card API interaction
    console.log(`[Card/Stripe] Processing payment of NLE ${amount} (Plan: ${plan})`);
    
    setTimeout(() => {
        res.json({ success: true, message: "Card payment successful", transaction_id: `CARD-${Date.now()}` });
    }, 1500);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
