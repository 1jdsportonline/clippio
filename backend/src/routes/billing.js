import { Router } from "express";
import express from "express";
import { stripe, PLAN_PRICE_IDS } from "../config/stripe.js";
import { supabase } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const billingRouter = Router();

billingRouter.post("/create-checkout-session", requireAuth, async (req, res) => {
  if (!stripe) return res.status(501).json({ error: "Stripe not configured" });
  const { plan } = req.body; // "creator" | "pro"
  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) return res.status(400).json({ error: "Unknown plan" });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", req.user.id).single();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: profile?.stripe_customer_id || undefined,
    customer_email: profile?.stripe_customer_id ? undefined : req.user.email,
    client_reference_id: req.user.id,
    success_url: `${process.env.CLIENT_URL}/settings?checkout=success`,
    cancel_url: `${process.env.CLIENT_URL}/settings?checkout=cancelled`,
  });

  res.json({ url: session.url });
});

/**
 * Stripe webhook — keeps `profiles.plan` / subscription_status in sync.
 * Must be mounted with the raw body parser (see src/index.js) so the
 * signature can be verified.
 */
export const billingWebhookRouter = Router();
billingWebhookRouter.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe) return res.status(501).send("Stripe not configured");

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const plan = session.amount_total > 1500 ? "pro" : "creator"; // simplistic mapping; prefer price ID lookup in production
      await supabase
        .from("profiles")
        .update({
          plan,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_status: "active",
          videos_used_this_period: 0,
        })
        .eq("id", session.client_reference_id);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await supabase
        .from("profiles")
        .update({ plan: "free", subscription_status: "cancelled" })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
});
