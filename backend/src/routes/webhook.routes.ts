import { Router } from "express";
import { handleStripeWebhook } from "../webhook/stripeWebhook"; 

const router = Router();

// ⚠️ precisa ser rawBody, não express.json()
router.post(
  "/stripe",
  (req, res, next) => {
    // Se já estiver usando express.raw em app.ts, pode remover isso
    next();
  },
  handleStripeWebhook
);

export default router;
