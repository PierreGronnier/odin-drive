const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
