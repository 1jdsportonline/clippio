import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.warn("[stripe] STRIPE_SECRET_KEY not set — billing routes will return 501 until configured");
}

export const stripe = key ? new Stripe(key, { apiVersion: "2024-06-20" }) : null;

export const PLAN_PRICE_IDS = {
  creator: process.env.STRIPE_PRICE_ID_CREATOR,
  pro: process.env.STRIPE_PRICE_ID_PRO,
};
