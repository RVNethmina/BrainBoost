import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nwihsqjcrzjlbibeyigo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53aWhzcWpjcnpqbGJpYmV5aWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODQxODksImV4cCI6MjA3MTA2MDE4OX0.WtxgjMfHhi_0Up37wavw0M5IZPv6-2vfbf-HY0pt234";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
