import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — database calls will fail until configured in .env"
  );
}

// Service-role client for trusted server-side operations only.
// Never send the service role key to the frontend.
export const supabase = url && serviceKey ? createClient(url, serviceKey) : null;
