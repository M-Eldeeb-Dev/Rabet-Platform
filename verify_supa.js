import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dthjbnvttpksusfkavsx.supabase.co";
const supabaseKey = "sb_publishable_yBubbJ5cQ6OQaotPlVVuHQ_4zstoZpT";

// Note: Using node-fetch if in older node, but node 18+ has fetch global.
// Usage: node verify_supa.js

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("Testing Supabase connection...");
  try {
    // Try to fetch something public or just get session
    // 'profiles' table might not exist yet if user hasn't run the SQL.
    // So we'll try a simpler health check or auth check.

    // Auth check doesn't require tables.
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Connection Error:", error.message);
    } else {
      console.log("Connection Successful!");
      console.log("Session Data:", data);
    }

    // Also try to hit the URL root just to see if it's reachable (simple fetch)
    const response = await fetch(supabaseUrl);
    console.log("Project URL reachable. Status:", response.status);
  } catch (err) {
    console.error("Unexpected Error:", err);
  }
}

testConnection();
